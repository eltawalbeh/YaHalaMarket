alter table public.leads
  drop constraint if exists leads_source_check;

alter table public.leads
  add constraint leads_source_check
  check (source in ('website','telegram','whatsapp','referral','direct','social','other'));

alter table public.leads
  add column if not exists telegram_user_id bigint;

create index if not exists leads_telegram_user_recent_idx
  on public.leads (telegram_user_id, created_at desc)
  where source = 'telegram';
