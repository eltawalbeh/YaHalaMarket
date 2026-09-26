import { supabase } from "@/lib/supabase/client"

export type SiteSettings = {
  id: string; brand_name: string; brand_name_ar: string; logo_url: string | null
  logo_mobile_url: string | null; footer_text: string; footer_text_ar: string
  contact_email: string; whatsapp_number: string; office_address: string
  office_address_ar: string; updated_by: string | null; updated_at: string
}
const fallback: SiteSettings = { id: "default", brand_name: "Ya Hala", brand_name_ar: "يا هلا", logo_url: null, logo_mobile_url: null, footer_text: "", footer_text_ar: "", contact_email: "", whatsapp_number: "", office_address: "", office_address_ar: "", updated_by: null, updated_at: new Date(0).toISOString() }
function deadline<T>(promise: PromiseLike<T>, message: string) {
  return Promise.race([Promise.resolve(promise), new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), 10000))])
}
export const siteContentService = {
  async get(): Promise<SiteSettings> {
    if (!supabase) return fallback
    const result = await deadline(supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(), "Site settings request timed out. Check migration 0006 and Supabase permissions.")
    if (result.error) throw new Error(result.error.message)
    return (result.data ?? fallback) as SiteSettings
  },
  async update(data: Partial<Omit<SiteSettings, "id" | "updated_at">>, userId: string): Promise<SiteSettings> {
    if (!supabase) return { ...fallback, ...data, updated_by: userId, updated_at: new Date().toISOString() }
    const result = await deadline(supabase.from("site_settings").upsert({ id: "default", ...data, updated_by: userId }).select().single(), "Site settings save timed out. Check migration 0006, the RLS policy, and the signed-in user role.")
    if (result.error) throw new Error(result.error.message)
    return result.data as SiteSettings
  },
}
