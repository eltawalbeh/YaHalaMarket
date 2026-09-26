-- Phases 16–20: lead performance and defense-in-depth.
-- Review against the deployed schema before applying in production.

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_assigned_to_idx on public.leads (assigned_to);

alter table public.leads enable row level security;

drop policy if exists "public can submit new leads" on public.leads;
create policy "public can submit new leads"
on public.leads for insert
to anon, authenticated
with check (
  status = 'new'
  and assigned_to is null
  and source = 'website'
);

-- Keep lead rows private: only active authenticated staff can read or update them.
drop policy if exists "active users can read leads" on public.leads;
create policy "active users can read leads"
on public.leads for select
to authenticated
using (is_active_user());

drop policy if exists "active users can update leads" on public.leads;
create policy "active users can update leads"
on public.leads for update
to authenticated
using (is_active_user())
with check (is_active_user());

