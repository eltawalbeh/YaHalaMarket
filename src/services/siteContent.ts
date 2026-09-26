import { supabase } from "@/lib/supabase/client"

export type SiteSettings = {
  id: string
  brand_name: string
  brand_name_ar: string
  logo_url: string | null
  logo_mobile_url: string | null
  footer_text: string
  footer_text_ar: string
  contact_email: string
  whatsapp_number: string
  office_address: string
  office_address_ar: string
  updated_by: string | null
  updated_at: string
}

const fallback: SiteSettings = {
  id: "default",
  brand_name: "Ya Hala",
  brand_name_ar: "يا هلا",
  logo_url: null,
  logo_mobile_url: null,
  footer_text: "",
  footer_text_ar: "",
  contact_email: "",
  whatsapp_number: "",
  office_address: "",
  office_address_ar: "",
  updated_by: null,
  updated_at: new Date(0).toISOString(),
}

export const siteContentService = {
  async get(): Promise<SiteSettings> {
    if (!supabase) return fallback
    const result = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle()
    if (result.error) throw new Error(result.error.message)
    return (result.data ?? fallback) as SiteSettings
  },
  async update(data: Partial<Omit<SiteSettings, "id" | "updated_at">>, userId: string): Promise<SiteSettings> {
    if (!supabase) return { ...fallback, ...data, updated_by: userId, updated_at: new Date().toISOString() }
    const request = supabase.from("site_settings").upsert({ id: "default", ...data, updated_by: userId }).select().single()
    const result = await Promise.race([
      request,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Site settings request timed out. Apply migration 0006 and check Supabase permissions.")), 10000)),
    ])
    if (result.error) throw new Error(result.error.message)
    return result.data as SiteSettings
  },
}