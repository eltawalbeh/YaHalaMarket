create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_ar text not null,
  status text not null check (status in ('draft','in_review','published','expired','archived')),
  destination jsonb not null,
  pricing jsonb not null,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  resource text not null,
  resource_id text not null,
  diff jsonb,
  created_at timestamptz not null default now()
);

alter table public.offers enable row level security;
alter table public.audit_log enable row level security;

-- Public users may read published offers only.
create policy "published offers are public"
on public.offers for select
using (status = 'published');

-- Dashboard policies must be added with authenticated role checks
-- and server-side role claims before production deployment.
