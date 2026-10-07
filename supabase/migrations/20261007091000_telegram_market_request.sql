-- Secure server-side Telegram Mini App submissions.
-- Apply after reviewing this migration; it is not applied to the connected project by this change.

create or replace function private.submit_telegram_market_request(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_offer_id uuid default null,
  p_notes text default '',
  p_pax_count integer default 1,
  p_preferred_dates text[] default '{}',
  p_budget_range text default null,
  p_submission_key uuid default null
)
returns public.leads
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.leads;
begin
  if length(trim(p_full_name)) not between 2 and 160
    or length(regexp_replace(p_phone, '[^0-9]', '', 'g')) not between 7 and 15 then
    raise exception 'Enter a valid name and phone number';
  end if;

  if p_pax_count is null or p_pax_count not between 1 and 100
    or length(coalesce(p_notes, '')) > 6000
    or coalesce(array_length(p_preferred_dates, 1), 0) > 20 then
    raise exception 'Invalid request details';
  end if;

  if p_offer_id is not null and not exists (
    select 1
    from public.offers
    where id = p_offer_id
      and status = 'published'
      and (expires_at is null or expires_at > now())
  ) then
    raise exception 'This package is no longer available';
  end if;

  perform pg_advisory_xact_lock(hashtext(trim(p_phone)));

  if p_submission_key is not null then
    select * into result
    from public.leads
    where submission_key = p_submission_key
      and phone = trim(p_phone)
      and full_name = trim(p_full_name);
    if found then return result; end if;
  end if;

  if (
    select count(*)
    from public.leads
    where phone = trim(p_phone)
      and source in ('website', 'social')
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Too many requests. Please contact us on WhatsApp';
  end if;

  insert into public.leads (
    full_name, phone, email, status, source, offer_id, notes, pax_count,
    preferred_dates, budget_range, submission_key
  )
  values (
    trim(p_full_name), trim(p_phone), nullif(trim(p_email), ''), 'new', 'social',
    p_offer_id, coalesce(p_notes, ''), p_pax_count, coalesce(p_preferred_dates, '{}'),
    nullif(trim(p_budget_range), ''), p_submission_key
  )
  returning * into result;

  return result;
end;
$$;

revoke all on function private.submit_telegram_market_request(text, text, text, uuid, text, integer, text[], text, uuid)
  from public, anon, authenticated;
grant usage on schema private to service_role;
grant execute on function private.submit_telegram_market_request(text, text, text, uuid, text, integer, text[], text, uuid)
  to service_role;

create or replace function public.submit_telegram_market_request(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_offer_id uuid default null,
  p_notes text default '',
  p_pax_count integer default 1,
  p_preferred_dates text[] default '{}',
  p_budget_range text default null,
  p_submission_key uuid default null
)
returns public.leads
language sql
set search_path = ''
as $$
  select private.submit_telegram_market_request(
    p_full_name, p_phone, p_email, p_offer_id, p_notes, p_pax_count,
    p_preferred_dates, p_budget_range, p_submission_key
  );
$$;

revoke all on function public.submit_telegram_market_request(text, text, text, uuid, text, integer, text[], text, uuid)
  from public, anon, authenticated;
grant execute on function public.submit_telegram_market_request(text, text, text, uuid, text, integer, text[], text, uuid)
  to service_role;
