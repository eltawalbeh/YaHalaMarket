create table if not exists public.site_settings (
  id text primary key default 'default',
  brand_name text not null default 'Ya Hala',
  brand_name_ar text not null default 'يا هلا',
  logo_url text,
  logo_mobile_url text,
  footer_text text not null default '',
  footer_text_ar text not null default '',
  contact_email text not null default '',
  whatsapp_number text not null default '',
  office_address text not null default '',
  office_address_ar text not null default '',
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values ('default')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "active users can read site settings" on public.site_settings;
create policy "active users can read site settings"
on public.site_settings for select
to authenticated
using (is_active_user());

drop policy if exists "managers manage site settings" on public.site_settings;
create policy "managers manage site settings"
on public.site_settings for all
to authenticated
using (has_role('manager'))
with check (has_role('manager'));

grant select, insert, update, delete on public.site_settings to authenticated;