begin;
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('super_admin','manager','staff','accounting'));
do $$
declare target text;
begin
  foreach target in array array['offers','hotels','hotel_rate_cards','leads','quotes'] loop
    execute format('create policy accounting_no_insert on public.%I as restrictive for insert to authenticated with check (coalesce(public.current_profile_role(), '''') <> ''accounting'')', target);
    execute format('create policy accounting_no_update on public.%I as restrictive for update to authenticated using (coalesce(public.current_profile_role(), '''') <> ''accounting'') with check (coalesce(public.current_profile_role(), '''') <> ''accounting'')', target);
    execute format('create policy accounting_no_delete on public.%I as restrictive for delete to authenticated using (coalesce(public.current_profile_role(), '''') <> ''accounting'')', target);
  end loop;
end $$;
commit;
