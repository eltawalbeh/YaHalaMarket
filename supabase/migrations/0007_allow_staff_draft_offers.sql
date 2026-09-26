drop policy if exists "managers can create offers" on public.offers;
drop policy if exists "active users can create draft offers" on public.offers;
drop policy if exists "active users can update own draft offers" on public.offers;

create policy "active users can create draft offers"
on public.offers for insert
to authenticated
with check (is_active_user() and created_by = auth.uid() and status in ('draft', 'in_review'));

create policy "managers can create offers"
on public.offers for insert
to authenticated
with check (has_role('manager') and created_by = auth.uid());

create policy "active users can update own draft offers"
on public.offers for update
to authenticated
using (is_active_user() and created_by = auth.uid() and status in ('draft', 'in_review'))
with check (is_active_user() and created_by = auth.uid() and status in ('draft', 'in_review'));