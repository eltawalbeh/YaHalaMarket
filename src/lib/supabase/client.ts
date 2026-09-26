import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL ?? "https://gmatzlnzgbbnsrtnbnag.supabase.co"
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "sb_publishable_3OE2-QYyHJVjS5ewt9wUKw_pyYOa9i4"

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null