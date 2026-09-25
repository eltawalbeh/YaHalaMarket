# Supabase integration boundary

- Frontend may use only the publishable/anon key.
- Service-role keys remain server-side.
- Every exposed table requires RLS.
- Public offer reads are limited to status = published.
- Offer expiry and renewal reminders run through scheduled server jobs.
- Email, Telegram, WhatsApp and NVIDIA AI calls must run through server-side functions.
