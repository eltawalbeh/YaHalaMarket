create or replace function public.create_public_lead(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_offer_id uuid default null,
  p_notes text default '',
  p_pax_count integer default 1,
  p_preferred_dates text[] default '{}',
  p_budget_range text default null
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  created_lead public.leads;
begin
  if nullif(trim(p_full_name), '') is null then raise exception 'full_name is required'; end if;
  if nullif(trim(p_phone), '') is null then raise exception 'phone is required'; end if;
  if p_pax_count is null or p_pax_count < 1 then raise exception 'pax_count must be positive'; end if;

  insert into public.leads (full_name, phone, email, status, source, offer_id, assigned_to, notes, pax_count, preferred_dates, budget_range)
  values (trim(p_full_name), trim(p_phone), nullif(trim(p_email), ''), 'new', 'website', p_offer_id, null, coalesce(p_notes, ''), p_pax_count, coalesce(p_preferred_dates, '{}'), p_budget_range)
  returning * into created_lead;

  return created_lead;
end;
$$;

revoke all on function public.create_public_lead(text, text, text, uuid, text, integer, text[], text) from public;
grant execute on function public.create_public_lead(text, text, text, uuid, text, integer, text[], text) to anon, authenticated;

