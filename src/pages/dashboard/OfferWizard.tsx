import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useLang } from "@/app/providers/LangContext"
import { useAuth } from "@/app/providers/AuthContext"
import { DASHBOARD_ROUTES } from "@/lib/routes"
import { offersService } from "@/services"

const STEPS = ["basics", "pricing", "details", "review"] as const
type Step = typeof STEPS[number]
const LABELS: Record<Step, { ar: string; en: string }> = {
  basics: { ar: "الأساسيات", en: "Basics" },
  pricing: { ar: "التسعير", en: "Pricing" },
  details: { ar: "التفاصيل", en: "Details" },
  review: { ar: "المراجعة", en: "Review" },
}
type FormState = {
  title: string; title_ar: string; city: string; city_ar: string
  country: string; country_ar: string; nights: string; expires_at: string
  price: string; currency: string; description: string; description_ar: string
}
const initialForm: FormState = {
  title: "", title_ar: "", city: "", city_ar: "", country: "", country_ar: "",
  nights: "3", expires_at: "", price: "", currency: "SAR", description: "", description_ar: "",
}
const timeout = <T,>(promise: Promise<T>, ms: number) => Promise.race([
  promise,
  new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Supabase request timed out. Check the database migration, RLS policies, and network connection.")), ms)),
])

export default function OfferWizard() {
  const { lang } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("basics")
  const [form, setForm] = useState<FormState>(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const index = STEPS.indexOf(step)
  const ar = lang === "ar"
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const createDraft = async () => {
    setError("")
    if (!user) { setError(ar ? "جلسة الدخول غير متاحة. سجّل الدخول مرة أخرى." : "Your session is not available. Please sign in again."); return }
    if (!form.title.trim() || !form.title_ar.trim() || !form.city.trim() || !form.country.trim() || !form.price.trim()) {
      setStep("basics")
      setError(ar ? "أكمل العنوان والوجهة والسعر قبل الحفظ." : "Complete the title, destination and price before saving.")
      return
    }
    setSaving(true)
    try {
      await timeout(offersService.create({
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "offer-" + Date.now(),
        title: form.title.trim(),
        title_ar: form.title_ar.trim(),
        description: form.description,
        description_ar: form.description_ar,
        status: "draft",
        destination: { city: form.city.trim(), city_ar: form.city_ar.trim(), country: form.country.trim(), country_ar: form.country_ar.trim(), country_code: "" },
        pricing: { base_price: Number(form.price) || 0, currency: form.currency.trim().toUpperCase() || "SAR", per_person: true, includes_flights: false, includes_hotel: true, includes_transfers: false },
        duration_nights: Math.max(1, Number(form.nights) || 1),
        departure_dates: [], hotel_ids: [], cover_image_url: null, tags: [], tags_ar: [],
        created_by: user.id, reviewed_by: null, published_at: null, expires_at: form.expires_at || null,
      }), 12000)
      navigate(DASHBOARD_ROUTES.offers)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : (ar ? "تعذر حفظ العرض." : "Could not save the offer."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="mb-6 text-xl font-bold">{ar ? "إضافة عرض جديد" : "Add new offer"}</h1>
        <div className="mb-8 flex items-center gap-2 overflow-x-auto">
          {STEPS.map((item, itemIndex) => <div key={item} className="flex shrink-0 items-center gap-2"><span className={"flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold " + (itemIndex <= index ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]")}>{itemIndex + 1}</span><span className="text-sm">{ar ? LABELS[item].ar : LABELS[item].en}</span>{itemIndex < STEPS.length - 1 && <span className="h-px w-6 bg-[var(--border)]" />}</div>)}
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl border border-[#f2b8b0] bg-[#fff1ef] px-4 py-3 text-sm text-[#a43a2c]">{error}</p>}
        <Card>
          {step === "basics" && <div className="grid gap-4 sm:grid-cols-2"><Field label="Title (English)" value={form.title} onChange={(v) => update("title", v)} /><Field label="العنوان بالعربي" value={form.title_ar} onChange={(v) => update("title_ar", v)} /><Field label="City" value={form.city} onChange={(v) => update("city", v)} /><Field label="المدينة" value={form.city_ar} onChange={(v) => update("city_ar", v)} /><Field label="Country" value={form.country} onChange={(v) => update("country", v)} /><Field label="الدولة" value={form.country_ar} onChange={(v) => update("country_ar", v)} /><Field label={ar ? "عدد الليالي" : "Nights"} type="number" value={form.nights} onChange={(v) => update("nights", v)} /><Field label={ar ? "تاريخ انتهاء العرض" : "Offer expiry"} type="date" value={form.expires_at} onChange={(v) => update("expires_at", v)} /></div>}
          {step === "pricing" && <div className="grid gap-4 sm:grid-cols-2"><Field label={ar ? "السعر" : "Price"} type="number" value={form.price} onChange={(v) => update("price", v)} /><Field label={ar ? "العملة" : "Currency"} value={form.currency} onChange={(v) => update("currency", v)} /></div>}
          {step === "details" && <div className="grid gap-4"><Field label="Description (English)" multiline value={form.description} onChange={(v) => update("description", v)} /><Field label="الوصف بالعربي" multiline value={form.description_ar} onChange={(v) => update("description_ar", v)} /></div>}
          {step === "review" && <div className="space-y-3 text-sm"><p><strong>{ar ? "العنوان" : "Title"}:</strong> {form.title_ar || form.title}</p><p><strong>{ar ? "الوجهة" : "Destination"}:</strong> {form.city_ar || form.city}, {form.country_ar || form.country}</p><p><strong>{ar ? "السعر" : "Price"}:</strong> {form.price || "0"} {form.currency}</p><p className="text-[var(--muted-foreground)]">{ar ? "سيتم حفظ العرض كمسودة." : "The offer will be saved as a draft."}</p></div>}
        </Card>
        <div className="mt-4 flex justify-between"><Button variant="secondary" disabled={saving} onClick={() => index === 0 ? navigate(DASHBOARD_ROUTES.offers) : setStep(STEPS[index - 1])}>{ar ? "السابق" : "Back"}</Button>{index < STEPS.length - 1 ? <Button onClick={() => { setError(""); setStep(STEPS[index + 1]) }}>{ar ? "التالي" : "Next"}</Button> : <Button disabled={saving} onClick={createDraft}>{saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ كمسودة" : "Save draft")}</Button>}</div>
      </div>
    </DashboardLayout>
  )
}

function Field({ label, value, onChange, type = "text", multiline = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; multiline?: boolean }) {
  const className = "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
  return <label className="grid gap-1.5 text-sm font-medium">{label}{multiline ? <textarea rows={5} value={value} onChange={(event) => onChange(event.target.value)} className={className} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={className} />}</label>
}
