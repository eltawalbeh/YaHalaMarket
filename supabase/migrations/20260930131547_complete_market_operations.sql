begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter table public.offers add column if not exists hotel_options jsonb not null default '[]';
alter table public.leads add column if not exists follow_up_at timestamptz;
alter table public.leads add column if not exists submission_key uuid unique;
alter table public.site_settings add column if not exists content jsonb not null default '{}';
update public.site_settings set whatsapp_number='966559934866' where id='default' and whatsapp_number='';

-- The owner account has been explicitly identified for the initial bootstrap.
update public.profiles set role='super_admin', full_name=case when full_name='' then 'Abdullah Tawalbeh' else full_name end,
full_name_ar=case when full_name_ar='' then 'عبدالله الطوالبة' else full_name_ar end
where lower(email)='abdullah@yahala.co';
alter table public.profiles alter column is_active set default false;

-- Public signups must never create an active employee account.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,email,is_active) values(new.id,coalesce(new.email,''),false) on conflict(id) do nothing;
  return new;
end; $$;
revoke execute on function public.handle_new_user() from public,anon,authenticated;

create policy "staff directory" on public.profiles for select to authenticated using(public.is_active_user());
create policy "managers read audit" on public.audit_log for select to authenticated using(public.has_role('manager'));
grant select on public.audit_log to authenticated;
grant select,update on public.profiles to authenticated;

create or replace function private.audit_market_change() returns trigger language plpgsql security definer set search_path='' as $$
declare row_data jsonb; changes jsonb;
begin
  row_data := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  select coalesce(jsonb_agg(key),'[]') into changes from jsonb_each(row_data)
    where tg_op<>'UPDATE' or value is distinct from to_jsonb(old)->key;
  insert into public.audit_log(user_id,action,resource,resource_id,diff)
  values(auth.uid(),lower(tg_op),tg_table_name,row_data->>'id',jsonb_build_object('fields',changes));
  return coalesce(new,old);
end; $$;
revoke all on function private.audit_market_change() from public,anon,authenticated;
do $$ declare tbl text; begin
  foreach tbl in array array['offers','hotels','hotel_rate_cards','leads','quotes','profiles','site_settings'] loop
    execute format('create trigger market_audit after insert or update or delete on public.%I for each row execute function private.audit_market_change()',tbl);
  end loop;
end $$;

create or replace function private.guard_profile() returns trigger language plpgsql set search_path='' as $$
begin
  if old.role='super_admin' and old.is_active and (new.role<>'super_admin' or not new.is_active) then
    perform pg_advisory_xact_lock(812324);
    if old.id=auth.uid() or not exists(select 1 from public.profiles where role='super_admin' and is_active and id<>old.id) then
      raise exception 'Cannot disable yourself or the last active administrator';
    end if;
  end if;
  return new;
end; $$;
create trigger guard_profile before update on public.profiles for each row execute function private.guard_profile();

-- Only a public projection is exposed; updater IDs and internal settings stay private.
create or replace function private.public_site_content() returns jsonb language sql stable security definer set search_path='' as $$
  select to_jsonb(s)-'updated_by' from public.site_settings s where id='default';
$$;
revoke all on function private.public_site_content() from public;
grant execute on function private.public_site_content() to anon,authenticated;
create or replace function public.get_site_content() returns jsonb language sql stable security invoker set search_path='' as $$ select private.public_site_content(); $$;
revoke all on function public.get_site_content() from public;
grant execute on function public.get_site_content() to anon,authenticated;

create policy "public offer hotels" on public.hotels for select to anon,authenticated using(
 is_active and exists(select 1 from public.offers o where o.status='published' and (o.expires_at is null or o.expires_at>now()) and hotels.id::text=any(o.hotel_ids))
);
grant select on public.hotels to anon;

drop policy if exists "public can submit new leads" on public.leads;
create policy "operations create leads" on public.leads for insert to authenticated with check(public.is_active_user() and public.current_profile_role()<>'accounting');
revoke insert,update on public.leads from anon;

-- This narrow entrypoint intentionally bypasses RLS: anonymous visitors can create
-- one new request and receive only that request, never list or update other leads.
create or replace function private.submit_market_request(
 p_full_name text,p_phone text,p_email text,p_offer_id uuid,p_notes text,p_pax_count integer,
 p_preferred_dates text[],p_budget_range text,p_submission_key uuid
) returns public.leads language plpgsql security definer set search_path='' as $$
declare result public.leads;
begin
 if auth.uid() is not null and public.current_profile_role()='accounting' then raise exception 'Read-only account'; end if;
 if length(trim(p_full_name)) not between 2 and 160 or length(regexp_replace(p_phone,'[^0-9]','','g')) not between 7 and 15 then raise exception 'Enter a valid name and phone number'; end if;
 if p_pax_count is null or p_pax_count not between 1 and 100 or length(coalesce(p_notes,''))>6000 or array_length(p_preferred_dates,1)>20 then raise exception 'Invalid request details'; end if;
 if p_offer_id is not null and not exists(select 1 from public.offers where id=p_offer_id and status='published' and (expires_at is null or expires_at>now())) then raise exception 'This package is no longer available'; end if;
 -- Serialize submissions for this phone so duplicate tabs cannot bypass limits.
 perform pg_advisory_xact_lock(hashtext(p_phone));
 if p_submission_key is not null then
   select * into result from public.leads where submission_key=p_submission_key and phone=trim(p_phone) and full_name=trim(p_full_name);
   if found then return result; end if;
 end if;
 if (select count(*) from public.leads where phone=trim(p_phone) and source='website' and created_at>now()-interval '1 hour')>=5 then raise exception 'Too many requests. Please contact us on WhatsApp'; end if;
 insert into public.leads(full_name,phone,email,status,source,offer_id,notes,pax_count,preferred_dates,budget_range,submission_key)
 values(trim(p_full_name),trim(p_phone),nullif(trim(p_email),''),'new','website',p_offer_id,coalesce(p_notes,''),p_pax_count,coalesce(p_preferred_dates,'{}'),p_budget_range,p_submission_key) returning * into result;
 return result;
end; $$;
revoke all on function private.submit_market_request(text,text,text,uuid,text,integer,text[],text,uuid) from public;
grant execute on function private.submit_market_request(text,text,text,uuid,text,integer,text[],text,uuid) to anon,authenticated;
create or replace function public.submit_market_request(p_full_name text,p_phone text,p_email text default null,p_offer_id uuid default null,p_notes text default '',p_pax_count integer default 1,p_preferred_dates text[] default '{}',p_budget_range text default null,p_submission_key uuid default null)
returns public.leads language sql security invoker set search_path='' as $$ select private.submit_market_request(p_full_name,p_phone,p_email,p_offer_id,p_notes,p_pax_count,p_preferred_dates,p_budget_range,p_submission_key); $$;
revoke all on function public.submit_market_request(text,text,text,uuid,text,integer,text[],text,uuid) from public;
grant execute on function public.submit_market_request(text,text,text,uuid,text,integer,text[],text,uuid) to anon,authenticated;
create or replace function public.create_public_lead(p_full_name text,p_phone text,p_email text default null,p_offer_id uuid default null,p_notes text default '',p_pax_count integer default 1,p_preferred_dates text[] default '{}',p_budget_range text default null)
returns public.leads language sql security invoker set search_path='' as $$ select private.submit_market_request(p_full_name,p_phone,p_email,p_offer_id,p_notes,p_pax_count,p_preferred_dates,p_budget_range,null); $$;
revoke all on function public.create_public_lead(text,text,text,uuid,text,integer,text[],text) from public;
grant execute on function public.create_public_lead(text,text,text,uuid,text,integer,text[],text) to anon,authenticated;

create policy "staff create assigned quotes" on public.quotes for insert to authenticated with check(public.is_active_user() and public.current_profile_role()='staff' and assigned_to=auth.uid());
create policy "staff update assigned quotes" on public.quotes for update to authenticated using(public.is_active_user() and public.current_profile_role()='staff' and assigned_to=auth.uid()) with check(public.is_active_user() and assigned_to=auth.uid());

create or replace function private.validate_quote() returns trigger language plpgsql set search_path='' as $$
declare line jsonb; total numeric:=0;
begin
 if jsonb_typeof(new.line_items)<>'array' or jsonb_array_length(new.line_items)>100 then raise exception 'Invalid quote items'; end if;
 if new.currency !~ '^[A-Z]{3}$' then raise exception 'Invalid currency'; end if;
 for line in select * from jsonb_array_elements(new.line_items) loop
   if coalesce(line->>'label','')='' and coalesce(line->>'label_ar','')='' then raise exception 'Item description is required'; end if;
   if coalesce((line->>'quantity')::numeric,0)<=0 or coalesce((line->>'unit_price')::numeric,-1)<0 or line->>'currency' is distinct from new.currency then raise exception 'Invalid item price, currency or quantity'; end if;
   total:=total+round((line->>'quantity')::numeric*(line->>'unit_price')::numeric,2);
 end loop;
 new.total_price:=total;
 if new.status in ('sent','viewed','under_discussion','accepted') and (jsonb_array_length(new.line_items)=0 or (new.valid_until<current_date and (tg_op='INSERT' or new.status is distinct from old.status))) then raise exception 'A shared quote needs items and a valid expiry date'; end if;
 if new.status='sent' and new.sent_at is null then new.sent_at:=now(); end if;
 if new.status='accepted' and new.accepted_at is null then new.accepted_at:=now(); end if;
 return new;
end; $$;
create trigger validate_quote before insert or update on public.quotes for each row execute function private.validate_quote();

-- A 144-bit random bearer token authorizes access to one customer-facing quote.
-- Lead contact details, employee IDs, internal records and all other quotes stay private.
create or replace function private.public_quote(p_token text,p_action text default 'read') returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.quotes;
begin
 if length(p_token)<32 or length(p_token)>80 then return null; end if;
 select * into q from public.quotes where token=p_token and status not in ('draft','withdrawn') for update;
 if not found then return null; end if;
 if p_action not in ('read','view','accept','discuss') then raise exception 'Invalid action'; end if;
 if p_action<>'read' and public.current_profile_role()='accounting' then raise exception 'Read-only account'; end if;
 if p_action<>'read' and q.valid_until<current_date and q.status<>'accepted' then raise exception 'This quote has expired'; end if;
 if p_action='accept' and q.status in ('sent','viewed','under_discussion') then
  update public.quotes set status='accepted',accepted_at=now() where id=q.id returning * into q;
 elsif p_action='discuss' and q.status in ('sent','viewed','under_discussion') then
  update public.quotes set status='under_discussion' where id=q.id returning * into q;
 elsif p_action='view' and q.status='sent' then
  update public.quotes set status='viewed',viewed_at=coalesce(viewed_at,now()) where id=q.id returning * into q;
 end if;
 return jsonb_build_object('reference',upper(substr(q.id::text,1,8)),'status',case when q.valid_until<current_date and q.status<>'accepted' then 'expired' else q.status end,'line_items',q.line_items,'total_price',q.total_price,'currency',q.currency,'valid_until',q.valid_until,'notes',q.notes,'notes_ar',q.notes_ar,'offer_id',q.offer_id,'accepted_at',q.accepted_at);
end; $$;
revoke all on function private.public_quote(text,text) from public;
grant execute on function private.public_quote(text,text) to anon,authenticated;
create or replace function public.get_public_quote(p_token text,p_action text default 'read') returns jsonb language sql security invoker set search_path='' as $$ select private.public_quote(p_token,p_action); $$;
revoke all on function public.get_public_quote(text,text) from public;
grant execute on function public.get_public_quote(text,text) to anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('market-media','market-media',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do nothing;
create policy "operations upload images" on storage.objects for insert to authenticated with check(bucket_id='market-media' and public.is_active_user() and public.current_profile_role()<>'accounting' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "operations read images" on storage.objects for select to authenticated using(bucket_id='market-media' and public.is_active_user());
create policy "operations remove own images" on storage.objects for delete to authenticated using(bucket_id='market-media' and ((owner_id=auth.uid()::text and public.current_profile_role()='staff') or public.has_role('manager')));
commit;
