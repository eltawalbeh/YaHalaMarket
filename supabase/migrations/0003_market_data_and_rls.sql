-- Phase 14: production data wiring and CMS CRUD.
-- Apply after 0001_market_foundation.sql and 0002_profiles_and_rls.sql.
-- Review in Supabase before applying to production.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.offers
  add column if not exists description text not null default '',
  add column if not exists description_ar text not null default '',
  add column if not exists duration_nights integer not null default 0,
  add column if not exists departure_dates text[] not null default '{}',
  add column if not exists hotel_ids text[] not null default '{}',
  add column if not exists cover_image_url text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists tags_ar text[] not null default '{}',
  add column if not exists reviewed_by uuid,
  add column if not exists published_at timestamptz;

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null default '',
  destination_city text not null,
  destination_city_ar text not null default '',
  destination_country text not null,
  destination_country_code text not null,
  stars integer not null check (stars between 1 and 5),
  address text not null default '',
  address_ar text not null default '',
  check_in_time text not null default '15:00',
  check_out_time text not null default '12:00',
  amenities text[] not null default '{}',
  amenities_ar text[] not null default '{}',
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique default ('YH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  full_name text not null,
  phone text not null,
  email text,
  status text not null default 'new' check (status in ('new','assigned','contacted','quote_in_progress','quote_sent','follow_up','sold','lost')),
  source text not null default 'website' check (source in ('website','whatsapp','referral','direct','social','other')),
  offer_id uuid references public.offers(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text not null default '',
  pax_count integer not null default 1 check (pax_count > 0),
  preferred_dates text[] not null default '{}',
  budget_range text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  status text not null default 'draft' check (status in ('draft','sent','viewed','under_discussion','accepted','expired','withdrawn')),
  lead_id uuid not null references public.leads(id) on delete restrict,
  offer_id uuid references public.offers(id) on delete set null,
  assigned_to uuid not null references public.profiles(id) on delete restrict,
  line_items jsonb not null default '[]'::jsonb,
  total_price numeric(12,2) not null default 0 check (total_price >= 0),
  currency text not null default 'SAR',
  valid_until date not null,
  notes text not null default '',
  notes_ar text not null default '',
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hotel_rate_cards (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  supplier_name text not null,
  room_type text not null,
  meal_plan text not null default '',
  valid_from date not null,
  valid_until date not null,
  currency text not null default 'SAR',
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  selling_price numeric(12,2) not null default 0 check (selling_price >= 0),
  occupancy integer not null default 2 check (occupancy > 0),
  document_ids text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','active','expired','archived')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_until >= valid_from)
);

alter table public.offers enable row level security;
alter table public.hotels enable row level security;
alter table public.leads enable row level security;
alter table public.quotes enable row level security;
alter table public.hotel_rate_cards enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_is_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_active from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update profile details"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_profile_role()
  and is_active = public.current_profile_is_active()
);

drop policy if exists "published offers are public" on public.offers;
drop policy if exists "public can read published offers" on public.offers;
create policy "public can read published offers" on public.offers for select
to anon, authenticated
using (status = 'published' and (expires_at is null or expires_at > now()));

create policy "active users can read offers" on public.offers for select
to authenticated using (is_active_user());
create policy "managers can create offers" on public.offers for insert
to authenticated with check (has_role('manager') and created_by = auth.uid());
create policy "managers can update offers" on public.offers for update
to authenticated using (has_role('manager')) with check (has_role('manager'));
create policy "managers can delete offers" on public.offers for delete
to authenticated using (has_role('manager'));

create policy "active users can read hotels" on public.hotels for select
to authenticated using (is_active_user());
create policy "managers manage hotels" on public.hotels for all
to authenticated using (has_role('manager')) with check (has_role('manager'));

create policy "public can submit new leads" on public.leads for insert
to anon, authenticated with check (status = 'new' and assigned_to is null);
create policy "active users can read leads" on public.leads for select
to authenticated using (is_active_user());
create policy "active users can update leads" on public.leads for update
to authenticated using (is_active_user()) with check (is_active_user());
create policy "managers can delete leads" on public.leads for delete
to authenticated using (has_role('manager'));

create policy "active users can read quotes" on public.quotes for select
to authenticated using (is_active_user());
create policy "managers manage quotes" on public.quotes for all
to authenticated using (has_role('manager')) with check (has_role('manager'));

create policy "active users can read rate cards" on public.hotel_rate_cards for select
to authenticated using (is_active_user());
create policy "managers manage rate cards" on public.hotel_rate_cards for all
to authenticated using (has_role('manager')) with check (has_role('manager'));

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at before update on public.offers
for each row execute function public.set_updated_at();
drop trigger if exists hotels_set_updated_at on public.hotels;
create trigger hotels_set_updated_at before update on public.hotels
for each row execute function public.set_updated_at();
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();
drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at before update on public.quotes
for each row execute function public.set_updated_at();
drop trigger if exists hotel_rate_cards_set_updated_at on public.hotel_rate_cards;
create trigger hotel_rate_cards_set_updated_at before update on public.hotel_rate_cards
for each row execute function public.set_updated_at();

grant select on public.offers to anon, authenticated;
grant select, insert, update on public.leads to anon, authenticated;
grant select on public.hotels, public.quotes, public.hotel_rate_cards to authenticated;
grant insert, update, delete on public.offers, public.hotels, public.quotes, public.hotel_rate_cards to authenticated;
