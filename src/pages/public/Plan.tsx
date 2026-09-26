import { useState } from "react"
import { PublicLayout } from "@/components/public/PublicLayout"
import { useLang } from "@/app/providers/LangContext"

type Form = {
  name: string
  whatsapp: string
  dest: string
  when: string
  notes: string
}

export default function Plan() {
  const { lang } = useLang()
  const ar = lang === "ar"

  const [form, setForm] = useState<Form>({
    name: "",
    whatsapp: "",
    dest: "",
    when: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <PublicLayout>
      <div className="pt-2 pb-20 max-w-5xl">
        {/* Heading */}
        <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--muted-foreground)] mb-5">
          {ar ? "احجز رحلتك" : "Plan a trip"}
        </p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-medium leading-[1.07] tracking-tight max-w-2xl mb-6">
          {ar ? "أخبرنا إلى أين تريد الذهاب" : "Tell us where you want to go"}
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-lg leading-relaxed mb-14">
          {ar
            ? "شارك معنا فكرتك، مواعيدك، وميزانيتك — وسيتواصل معك أحد متخصصي الرحلات خلال يوم عمل واحد."
            : "Share a rough idea, your dates and a budget. A trip specialist will reply within one working day with a first route and a fixed price."}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: contact info */}
          <div className="divide-y divide-[var(--border)]">
            {[
              {
                icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                labelEn: "EMAIL", labelAr: "البريد الإلكتروني",
                valueEn: "hello@yahala.co", valueAr: "hello@yahala.co",
              },
              {
                icon: "M12 18h.01M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32",
                labelEn: "WHATSAPP", labelAr: "واتساب",
                valueEn: "+966 55 000 0000", valueAr: "+966 55 000 0000",
              },
              {
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                labelEn: "HOURS", labelAr: "أوقات العمل",
                valueEn: "Sun – Thu, 9am – 6pm", valueAr: "الأحد – الخميس، ٩ص – ٦م",
              },
              {
                icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                labelEn: "OFFICE", labelAr: "المقر",
                valueEn: "Riyadh, Saudi Arabia", valueAr: "الرياض، المملكة العربية السعودية",
              },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-4 py-5">
                <div className="w-9 h-9 rounded-full bg-[var(--secondary)] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d={row.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-medium tracking-widest uppercase text-[var(--muted-foreground)] mb-0.5">
                    {ar ? row.labelAr : row.labelEn}
                  </p>
                  <p className="text-sm text-[var(--foreground)] font-medium">
                    {ar ? row.valueAr : row.valueEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: form */}
          <div className="bg-[var(--card)] rounded-2xl p-7 lg:p-9 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-medium mb-3">
                  {ar ? "تم إرسال طلبك!" : "Request sent!"}
                </h2>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                  {ar
                    ? "سيتواصل معك أحد متخصصي الرحلات خلال يوم عمل واحد."
                    : "A trip specialist will be in touch within one working day."}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-6">
                  {ar ? "ابدأ استفسارك" : "Start your enquiry"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {ar ? "الاسم الكامل" : "Your name"}
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder={ar ? "محمد العمري" : "Jane Smith"}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {ar ? "رقم الواتساب" : "WhatsApp number"}
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                      placeholder="+966 5X XXX XXXX"
                      dir="ltr"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {ar ? "الوجهة المفضلة" : "Where to?"}
                    </label>
                    <div className="relative">
                      <select
                        value={form.dest}
                        onChange={(e) => setForm((f) => ({ ...f, dest: e.target.value }))}
                        className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors cursor-pointer pe-10"
                      >
                        <option value="">{ar ? "لست متأكداً بعد" : "Not sure yet"}</option>
                        <option value="TR">{ar ? "إسطنبول، تركيا" : "Istanbul, Turkey"}</option>
                        <option value="MV">{ar ? "المالديف" : "Maldives"}</option>
                        <option value="GE">{ar ? "جورجيا" : "Georgia"}</option>
                        <option value="JP">{ar ? "اليابان" : "Japan"}</option>
                        <option value="IT">{ar ? "إيطاليا" : "Italy"}</option>
                        <option value="GR">{ar ? "اليونان" : "Greece"}</option>
                        <option value="other">{ar ? "وجهة أخرى" : "Other destination"}</option>
                      </select>
                      <svg className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {ar ? "موعد السفر وعدد المسافرين" : "When, and how many?"}
                    </label>
                    <input
                      value={form.when}
                      onChange={(e) => setForm((f) => ({ ...f, when: e.target.value }))}
                      placeholder={ar ? "شخصان، أواخر أكتوبر" : "Two of us, late October"}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--muted-foreground)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {ar ? "أخبرنا عن رحلتك" : "Tell us about the trip"}
                    </label>
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder={ar ? "ما تحب وما تفضل تجنبه، الميزانية التقريبية للشخص…" : "What you love, what you'd skip, a rough budget per person."}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] transition-colors resize-none placeholder:text-[var(--muted-foreground)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full py-4 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {submitting
                      ? (ar ? "جارٍ الإرسال…" : "Sending…")
                      : (ar ? "أرسل طلبك" : "Send enquiry")}
                    {!submitting && <span dir="ltr">→</span>}
                  </button>

                  <p className="text-center text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                    {ar
                      ? "لا يوجد أي التزام مالي. بياناتك محمية تماماً."
                      : "No payment and no obligation. We never share your details."}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
