# Phase 13 — Supabase Auth and Data Integration

This phase replaces the current mock-only authentication boundary with a Supabase-ready adapter while preserving a local demo fallback until environment variables are configured.

## Files to copy

- `src/lib/supabase/client.ts` → `src/lib/supabase/client.ts`
- `src/app/providers/AuthContext.tsx` → `src/app/providers/AuthContext.tsx`
- `env.example` → use it as a reference for environment variables; do not commit a real `.env` file
- `supabase/migrations/0002_profiles_and_rls.sql` → apply in Supabase after reviewing the policies

`env.example` is intentionally named without a leading dot so Figma Make can import it. You may rename it to `.env` only inside the local/runtime environment after copying the values.

## Dependency

Install the official client before copying the AuthContext file:

```bash
pnpm add @supabase/supabase-js
```

## Environment

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The anon key is intended for the browser; never expose a service-role key in Vite environment variables.

If the variables are missing, the app keeps using the existing mock user so the UI remains previewable. This fallback must be disabled before production launch.

## Acceptance checks

1. With no Supabase variables, the preview still loads using mock mode.
2. With Supabase variables, `/login` uses `signInWithPassword`.
3. Refreshing an authenticated session restores the user from `onAuthStateChange`.
4. Logout calls `signOut` and returns the user to `/login` through the existing route guard.
5. The `profiles` RLS policies prevent users from editing another user’s profile.
