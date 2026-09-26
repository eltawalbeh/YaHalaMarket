import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PublicLayout } from "@/components/public/PublicLayout"
import { useLang } from "@/app/providers/LangContext"
import { leadsService, offersService } from "@/services"
import { trackEvent } from "@/lib/analytics"
import { formatPrice } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import type { Offer } from "@/types"

type Form = {
  name: string
  whatsapp: string
  dest: string
  when: string
  notes: string
}

const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER ?? "966559934866").replace(/\D/g, "")

export default function Plan() {
  const { lang } = useLang()
  const ar = lang === "ar"
  const [searchParams] = useSearchParams()
  const offerSlug = searchParams.get("offer")
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [offerLoading, setOfferLoading] = useState(Boolean(offerSlug))
  const [offerError, setOfferError] = useState(false)
  const [form, setForm] = useState<Form>({ name: "", whatsapp: "", dest: "", when: "", notes: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let active = true
    if (!offerSlug) {
      setOfferLoading(false)
      return
    }
    setOfferLoading(true)
    setOfferError(false)
    offersService.getBySlug(offerSlug)
      .then((offer) => {
        if (!active) return
        setSelectedOffer(offer)
        if (offer) {
          const destination = lang === "ar" ? offer.destination.city_ar : offer.destination.city
          setForm((current) => ({ ...current, dest: destination }))
        } else {
          setOfferError(true)
        }
      })
      .catch(() => {
        if (active) setOfferError(true)
      })
      .finally(() => {
        if (active) setOfferLoading(false)
      })
    return () => { active = false }
  }, [offerSlug, lang])

  useEffect(() => {
    document.title = selectedOffer
      ? (ar ? `طلب عرض: ${selectedOffer.title_ar}` : `Request quote: ${selectedOffer.title}`)
      : (ar ? "خطط رحلتك | يا هلا" : "Plan a trip | Ya Hala")
    trackEvent("plan_view", { language: lang, offer: offerSlug ?? undefined })
  }, [ar, lang, offerSlug, selectedOffer])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      window.alert(ar ? "قاعدة البيانات غير متصلة حاليًا. يرجى ضبط إعدادات Supabase في بيئة النشر." : "The database is not connected. Configure the Supabase environment variables before submitting.")
      return
    }
    setSubmitting(true)
    try {
      const lead = await leadsService.create({
        full_name: form.name.trim(),
        phone: form.whatsapp.trim(),
        email: null,
        source: "website",
        offer_id: selectedOffer?.id ?? null,
        assigned_to: null,
        notes: [selectedOffer ? `Package: ${selectedOffer.title}` : "", form.dest, form.when, form.notes].filter(Boolean).join("\n"),
        pax_count: 1,
        preferred_dates: form.when ? [form.when] : [],
        budget_range: null,
      })

      const reference = lead.reference_id ?? lead.id.slice(0, 8)
      const message = [
        selectedOffer
          ? (ar ? "مرحباً، أريد الاستفسار عن هذه الباقة من موقع يا هلا." : "Hello, I would like to enquire about this package from Ya Hala.")
          : (ar ? "مرحباً، أرسلت طلب تخطيط رحلة من موقع يا هلا." : "Hello, I submitted a trip planning request from Ya Hala."),
        ar ? `الباقة: ${selectedOffer?.title_ar ?? "طلب تخطيط رحلة"}` : `Package: ${selectedOffer?.title ?? "Trip planning request"}`,
        ar ? `المرجع: ${reference}` : `Reference: ${reference}`,
        ar ? `الاسم: ${form.name}` : `Name: ${form.name}`,
        ar ? `الوجهة: ${form.dest || "غير محددة"}` : `Destination: ${form.dest || "Not specified"}`,
        ar ? `الموعد/المسافرون: ${form.when || "غير محدد"}` : `Dates/travellers: ${form.when || "Not specified"}`,
        form.notes ? (ar ? `التفاصيل: ${form.notes}` : `Details: ${form.notes}`) : "",
      ].filter(Boolean).join("\n")

      setSubmitting(false)
      setSubmitted(true)
      trackEvent("plan_submit", { reference, language: lang, offer: selectedOffer?.slug ?? undefined })
      if (WHATSAPP_NUMBER) {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
        trackEvent("whatsapp_click", { reference, language: lang, offer: selectedOffer?.slug ?? undefined })
      }
    } catch {
      setSubmitting(false)
      window.alert(ar ? "تعذر إرسال الطلب. حاول مرة أخرى." : "We could not send your request. Please try again.")
    }
  }

  const title = selectedOffer ? (ar ? selectedOffer.title_ar : selectedOffer.title) : null
  const destination = selectedOffer ? (ar ? selectedOffer.destination.city_ar : selectedOffer.destination.city) : null

  if (offerLoading) {
    return <PublicLayout><p className="py-20 text-center text-[var(--muted-foreground)]">{ar ? "جارٍ تحميل تفاصيل الباقة…" : "Loading package details…"}</p></PublicLayout>
  }

  if (offerError) {
    return (
      <PublicLayout>
        <div className="py-20 max-w-xl">
          <h1 className="font-display text-4xl font-medium mb-4">{ar ? "الباقة غير متاحة" : "Package unavailable"}</h1>
          <p className="text-[var(--muted-foreground)] mb-6">{ar ? "هذه الباقة غير موجودة أو لم تعد منشورة." : "This package does not exist or is no longer published."}</p>
          <Link to="/offers" className="text-sm underline">{ar ? "العودة إلى الباقات" : "Back to packages"}</Link>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="pt-2 pb-20 max-w-5xl">
        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--muted-foreground)] mb-5">
          {selectedOffer ? (ar ? "طلب عرض سعر" : "Request a quote") : (ar ? "احجز رحلتك" : "Plan a trip")}
        </p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-medium leading-[1.07] tracking-tight max-w-2xl mb-6">
          {selectedOffer ? (ar ? "ابدأ طلبك لهذه الباقة" : "Start your request for this package") : (ar ? "أخبرنا إلى أين تريد الذهاب" : "Tell us where you want to go")}
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-lg leading-relaxed mb-14">
          {selectedOffer
            ? (ar ? "أرسل بياناتك وسيتواصل معك أحد متخصصي الرحلات لتأكيد التفاصيل والسعر النهائي." : "Share your details and a trip specialist will contact you to confirm the details and final price.")
            : (ar ? "شارك معنا فكرتك، مواعيدك، وميزانيتك — وسيتواصل معك أحد متخصصي الرحلات خلال يوم عمل واحد." : "Share a rough idea, your dates and a budget. A trip specialist will reply within one working day with a first route and a fixed price.")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="divide-y divide-[var(--border)]">
            {selectedOffer && (
              <div className="pb-6 mb-1">
                <p className="text-[10px] font-medium tracking-widest uppercase text-[var(--muted-foreground)] mb-2">{ar ? "الباقة المحددة" : "Selected package"}</p>
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">{destination} · {selectedOffer.duration_nights} {ar ? "ليالٍ" : "nights"}</p>
                <p className="text-lg font-semibold text-[var(--primary)] numerals-latin mt-3">{formatPrice(selectedOffer.pricing.base_price, selectedOffer.pricing.currency)}</p>
              </div>
            )}
            <div className="pt-5">
              <p className="text-sm text-[var(--muted-foreground)]">{ar ? "سيتم إرسال طلبك إلى فريق الرحلات ومتابعته عبر واتساب." : "Your request will be sent to our trip team and followed up through WhatsApp."}</p>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-2xl p-7 lg:p-9 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center mx-auto mb-5"><span className="text-white text-2xl">✓</span></div>
                <h2 className="font-display text-2xl font-medium mb-3">{ar ? "تم إرسال طلبك!" : "Request sent!"}</h2>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{ar ? "سيتواصل معك أحد متخصصي الرحلات خلال يوم عمل واحد." : "A trip specialist will be in touch within one working day."}</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-6">{selectedOffer ? (ar ? "بياناتك" : "Your details") : (ar ? "ابدأ استفسارك" : "Start your enquiry")}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{ar ? "الاسم الكامل" : "Your name"}</label>
                    <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={ar ? "محمد العمري" : "Jane Smith"} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{ar ? "رقم الواتساب" : "WhatsApp number"}</label>
                    <input required type="tel" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="+966 5X XXX XXXX" dir="ltr" className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]" />
                  </div>
                  {!selectedOffer && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{ar ? "الوجهة المفضلة" : "Where to?"}</label>
                      <select value={form.dest} onChange={(e) => setForm((f) => ({ ...f, dest: e.target.value }))} className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors cursor-pointer">
                        <option value="">{ar ? "لست متأكداً بعد" : "Not sure yet"}</option>
                        <option value="TR">{ar ? "إسطنبول، تركيا" : "Istanbul, Turkey"}</option>
                        <option value="MV">{ar ? "المالديف" : "Maldives"}</option>
                        <option value="GE">{ar ? "جورجيا" : "Georgia"}</option>
                        <option value="JP">{ar ? "اليابان" : "Japan"}</option>
                        <option value="IT">{ar ? "إيطاليا" : "Italy"}</option>
                        <option value="GR">{ar ? "اليونان" : "Greece"}</option>
                        <option value="other">{ar ? "وجهة أخرى" : "Other destination"}</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{ar ? "موعد السفر وعدد المسافرين" : "When, and how many?"}</label>
                    <input value={form.when} onChange={(e) => setForm((f) => ({ ...f, when: e.target.value }))} placeholder={ar ? "شخصان، أواخر أكتوبر" : "Two of us, late October"} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{ar ? "أخبرنا عن رحلتك" : "Tell us about the trip"}</label>
                    <textarea rows={4} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder={ar ? "ما تحب وما تفضل تجنبه، الميزانية التقريبية للشخص…" : "What you love, what you'd skip, a rough budget per person."} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors resize-none placeholder:text-[var(--muted-foreground)]" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full py-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                    {submitting ? (ar ? "جارٍ الإرسال…" : "Sending…") : (ar ? "أرسل طلبك" : "Send enquiry")} {!submitting && <span dir="ltr">→</span>}
                  </button>
                  <p className="text-center text-[11px] text-[var(--muted-foreground)] leading-relaxed">{ar ? "لا يوجد أي التزام مالي. بياناتك محمية تماماً." : "No payment and no obligation. We never share your details."}</p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}