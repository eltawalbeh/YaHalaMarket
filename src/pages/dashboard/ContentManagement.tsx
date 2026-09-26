import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useLang } from "@/app/providers/LangContext"
import { useAuth } from "@/app/providers/AuthContext"
import { siteContentService, type SiteSettings } from "@/services/siteContent"

export default function ContentManagement() {
  const { lang } = useLang()
  const { user } = useAuth()
  const ar = lang === "ar"
  const [form, setForm] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    siteContentService.get().then(setForm).catch((error) => setMessage(error.message))
  }, [])

  const set = (key: keyof SiteSettings, value: string) => {
    setForm((current) => current ? { ...current, [key]: value } : current)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !user) return
    setSaving(true)
    setMessage("")
    try {
      const saved = await siteContentService.update({
        brand_name: form.brand_name,
        brand_name_ar: form.brand_name_ar,
        logo_url: form.logo_url,
        logo_mobile_url: form.logo_mobile_url,
        footer_text: form.footer_text,
        footer_text_ar: form.footer_text_ar,
        contact_email: form.contact_email,
        whatsapp_number: form.whatsapp_number,
        office_address: form.office_address,
        office_address_ar: form.office_address_ar,
      }, user.id)
      setForm(saved)
      setMessage(ar ? "تم حفظ التغييرات." : "Changes saved.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (ar ? "تعذر الحفظ." : "Could not save changes."))
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <DashboardLayout><p className="text-sm text-[var(--muted-foreground)]">{ar ? "جارٍ تحميل إعدادات الموقع…" : "Loading site settings…"}</p></DashboardLayout>

  const field = (key: keyof SiteSettings, label: string, type = "text") => (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <input type={type} value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius)] bg-[var(--background)]" />
    </label>
  )

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-xl font-bold mb-2">{ar ? "إدارة محتوى الموقع" : "Site Content Management"}</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">{ar ? "غيّر المعلومات العامة التي تظهر في الموقع من هنا." : "Manage the public site information from one place."}</p>
        <form onSubmit={save} className="space-y-4">
          <Card><CardHeader><h2 className="font-semibold text-sm">{ar ? "الهوية" : "Brand"}</h2></CardHeader><div className="grid sm:grid-cols-2 gap-4">{field("brand_name", ar ? "اسم العلامة بالإنجليزية" : "Brand name")}{field("brand_name_ar", ar ? "اسم العلامة بالعربية" : "Arabic brand name")}{field("logo_url", ar ? "رابط اللوجو الرئيسي" : "Main logo URL", "url")}{field("logo_mobile_url", ar ? "رابط لوجو الموبايل" : "Mobile logo URL", "url")}</div></Card>
          <Card><CardHeader><h2 className="font-semibold text-sm">{ar ? "الفوتر والتواصل" : "Footer & Contact"}</h2></CardHeader><div className="space-y-4">{field("footer_text", ar ? "نص الفوتر بالإنجليزية" : "Footer text")}{field("footer_text_ar", ar ? "نص الفوتر بالعربية" : "Arabic footer text")}{field("contact_email", ar ? "البريد الإلكتروني" : "Contact email", "email")}{field("whatsapp_number", ar ? "رقم الواتساب" : "WhatsApp number", "tel")}{field("office_address", ar ? "العنوان بالإنجليزية" : "Office address")}{field("office_address_ar", ar ? "العنوان بالعربية" : "Arabic office address")}</div></Card>
          <div className="flex items-center gap-3"><Button type="submit" disabled={saving}>{saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ التغييرات" : "Save changes")}</Button>{message && <span className="text-sm text-[var(--muted-foreground)]">{message}</span>}</div>
        </form>
      </div>
    </DashboardLayout>
  )
}