import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/app/providers/LangContext";
import { useSite } from "@/app/providers/SiteContext";
import { useResource, errorMessage } from "@/lib/request";
import { offersService, leadsService } from "@/services";
import { buildWhatsAppUrl } from "@/lib/leadCapture";
import {
  Field,
  Feedback,
  LoadingState,
  Icon,
} from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
export default function Plan() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { site } = useSite();
  const [params] = useSearchParams();
  const slug = params.get("offer");
  const r = useResource(
    () => (slug ? offersService.getBySelector(slug) : Promise.resolve(null)),
    [slug],
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    destination: "",
    when: "",
    pax: 1,
    budget: "",
    notes: "",
    website: "",
  });
  const key = useRef(crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    reference: string;
    url: string;
  } | null>(null);
  const set = (field: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.website || busy) return;
    setBusy(true);
    setError("");
    let popup: Window | null = null;
    try {
      popup = window.open("about:blank", "_blank");
      if (popup) popup.opener = null;
      const offer = r.data;
      const destination = offer
        ? ar
          ? offer.destination.city_ar
          : offer.destination.city
        : form.destination;
      const lead = await leadsService.create({
        full_name: form.name.trim(),
        phone: form.phone.trim(),
        email: null,
        status: "new",
        source: "website",
        offer_id: offer?.id || null,
        assigned_to: null,
        notes: [offer ? "Package: " + offer.title : "", destination, form.notes]
          .filter(Boolean)
          .join("\n"),
        pax_count: form.pax,
        preferred_dates: form.when ? [form.when] : [],
        budget_range: form.budget || null,
        submission_key: key.current,
      });
      const reference = lead.reference_id || lead.id.slice(0, 8);
      const message = [
        ar
          ? "مرحباً، أرسلت طلب رحلة من موقع يا هلا."
          : "Hello, I submitted a travel request from Ya Hala.",
        (ar ? "المرجع: " : "Reference: ") + reference,
        (ar ? "الاسم: " : "Name: ") + form.name,
        (ar ? "الباقة: " : "Package: ") +
          (offer
            ? ar
              ? offer.title_ar
              : offer.title
            : ar
              ? "رحلة مخصصة"
              : "Custom trip"),
        (ar ? "الوجهة: " : "Destination: ") + (destination || "—"),
        (ar ? "الموعد: " : "Dates: ") + (form.when || "—"),
        (ar ? "عدد المسافرين: " : "Travellers: ") + form.pax,
        form.notes,
      ]
        .filter(Boolean)
        .join("\n");
      const url = buildWhatsAppUrl(
        site.whatsapp_number || "966559934866",
        message,
      );
      setSuccess({ reference, url });
      trackEvent("lead_submitted", { reference, offer: offer?.slug });
      if (popup) popup.location.replace(url);
    } catch (e) {
      popup?.close();
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const offer = r.data;
  if (slug && (r.loading || r.error))
    return (
      <PublicLayout>
        <LoadingState {...r} retry={r.reload} />
      </PublicLayout>
    );
  if (slug && !offer)
    return (
      <PublicLayout>
        <div className="empty-state">
          <h1 className="text-2xl mb-4">
            {ar ? "الباقة غير متاحة" : "Package unavailable"}
          </h1>
          <p>
            {ar
              ? "هذه الباقة غير موجودة أو انتهت صلاحيتها."
              : "This package no longer exists or has expired."}
          </p>
          <Link to="/offers" className="text-[var(--primary)] block mt-5">
            {ar ? "استعرض الباقات" : "Browse packages"}
          </Link>
        </div>
      </PublicLayout>
    );
  return (
    <PublicLayout>
      <div className="max-w-5xl pb-12" style={{ direction: "ltr" }}>
        <section className="max-w-2xl pt-2 mb-14" dir={ar ? "rtl" : "ltr"}>
          <p className="text-[11px] text-[var(--primary)] mb-5">
            {offer
              ? ar
                ? "طلب عرض الباقة"
                : "Package enquiry"
              : ar
                ? "احجز رحلتك"
                : "Plan a trip"}
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-[68px] leading-[1.2] font-medium mb-6">
            {offer
              ? ar
                ? offer.title_ar
                : offer.title
              : site.content[ar ? "plan_title_ar" : "plan_title"]}
          </h1>
          <p className="max-w-lg text-[var(--muted-foreground)] leading-8">
            {offer
              ? ar
                ? "أرسل بياناتك ليؤكد فريق الرحلات تفاصيل هذه الباقة والسعر النهائي."
                : "Share your details to confirm this package and its final price."
              : site.content[ar ? "plan_text_ar" : "plan_text"]}
          </p>
        </section>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-20 items-start">
          <section className="panel !p-7 lg:!p-9" dir={ar ? "rtl" : "ltr"}>
            {success ? (
              <div className="text-center py-14">
                <h2>
                  {ar ? "تم تسجيل طلبك بنجاح" : "Your request has been saved"}
                </h2>
                <p className="text-sm my-5">
                  {ar ? "رقم المرجع: " : "Reference: "}
                  <strong dir="ltr">{success.reference}</strong>
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">
                  {ar
                    ? "أكمل إرسال الرسالة في واتساب، أو افتحه من الزر أدناه."
                    : "Send the prefilled message in WhatsApp, or open it using the button below."}
                </p>
                <a
                  href={success.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-xl bg-[var(--primary)] text-white px-5 py-3"
                >
                  {ar ? "فتح واتساب" : "Open WhatsApp"}
                </a>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-5">
                <h2>{ar ? "ابدأ استفسارك" : "Start your enquiry"}</h2>
                {offer && (
                  <div className="bg-[var(--secondary)] rounded-xl p-4 text-sm">
                    <strong>{ar ? offer.title_ar : offer.title}</strong>
                    <p className="mt-2">
                      {ar ? offer.destination.city_ar : offer.destination.city}{" "}
                      · {offer.duration_nights} {ar ? "ليالٍ" : "nights"}
                    </p>
                    <p className="mt-2 text-[var(--primary)]">
                      {offer.pricing.base_price.toLocaleString("en-US")}{" "}
                      {offer.pricing.currency}
                    </p>
                  </div>
                )}
                <Field label={ar ? "الاسم الكامل" : "Full name"}>
                  <input
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={160}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </Field>
                <Field label={ar ? "رقم الواتساب" : "WhatsApp number"}>
                  <input
                    autoComplete="tel"
                    required
                    type="tel"
                    pattern="[+0-9 ()-]{7,25}"
                    dir="ltr"
                    placeholder="+966 5X XXX XXXX"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                {!offer && (
                  <Field
                    label={ar ? "الوجهة المفضلة" : "Preferred destination"}
                  >
                    <input
                      placeholder={
                        ar
                          ? "الوجهة أو لست متأكداً بعد"
                          : "Destination, or not sure yet"
                      }
                      value={form.destination}
                      maxLength={160}
                      onChange={(e) => set("destination", e.target.value)}
                    />
                  </Field>
                )}
                <div className="form-grid">
                  <Field label={ar ? "موعد السفر" : "Travel dates"}>
                    <input
                      value={form.when}
                      maxLength={160}
                      placeholder={ar ? "أواخر أكتوبر" : "Late October"}
                      onChange={(e) => set("when", e.target.value)}
                    />
                  </Field>
                  <Field label={ar ? "عدد المسافرين" : "Travellers"}>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={form.pax}
                      onChange={(e) => set("pax", Number(e.target.value))}
                    />
                  </Field>
                </div>
                <Field
                  label={ar ? "الميزانية التقريبية" : "Approximate budget"}
                >
                  <input
                    value={form.budget}
                    maxLength={100}
                    placeholder={ar ? "المبلغ والعملة" : "Amount and currency"}
                    onChange={(e) => set("budget", e.target.value)}
                  />
                </Field>
                <Field
                  label={ar ? "أخبرنا عن رحلتك" : "Tell us about your trip"}
                >
                  <textarea
                    rows={4}
                    maxLength={4000}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </Field>
                <label className="hidden" aria-hidden="true">
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                  />
                </label>
                <Feedback error={error} />
                <Button type="submit" disabled={busy}>
                  {busy
                    ? ar
                      ? "جارٍ الإرسال…"
                      : "Sending…"
                    : ar
                      ? "أرسل طلبك ←"
                      : "Send enquiry →"}
                </Button>
                <p className="text-center text-[10px] text-[var(--muted-foreground)]">
                  {ar ? "لا يوجد التزام مالي. " : "No payment is collected. "}
                  <Link to="/legal" className="underline">
                    {ar ? "الخصوصية والشروط" : "Privacy & terms"}
                  </Link>
                </p>
              </form>
            )}
          </section>
          <aside
            className="relative rounded-2xl overflow-hidden min-h-[630px] mt-5"
            dir={ar ? "rtl" : "ltr"}
          >
            <img
              src="/assets/figma/0d235.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#102b4d88] to-[#102b4d22]" />
            <div className="relative text-white p-8">
              <span className="text-xs px-3 py-1 rounded-full bg-white/20">
                {ar ? "استفسار رحلة" : "Trip enquiry"}
              </span>
              <h2 className="text-3xl font-bold mt-8 mb-4">
                {ar
                  ? "تخطيط رحلات مخصصة مع فريق يا هلا"
                  : "Personalised travel planning with Ya Hala"}
              </h2>
              <p className="text-sm leading-7 text-white/90">
                {ar
                  ? "شارك تفاصيل رحلتك، وسنقوم بربطها بتصميم برنامج متكامل يناسب عدد المسافرين وميزانيتك."
                  : "Share your trip details and we will plan an itinerary around your group and budget."}
              </p>
              <div className="bg-[#102b4d88] rounded-xl p-5 mt-6 grid gap-5">
                {[
                  [
                    "d7189",
                    ar
                      ? "وجهات متعددة وخيارات مرنة"
                      : "Destinations and flexible options",
                  ],
                  [
                    "36af2",
                    ar
                      ? "مواعيد مرنة ومتابعة فورية"
                      : "Flexible dates and follow-up",
                  ],
                  [
                    "decad",
                    ar
                      ? "متابعة واضحة عبر واتساب"
                      : "Clear follow-up via WhatsApp",
                  ],
                ].map(([file, label]) => (
                  <p className="flex items-center gap-3 text-xs" key={file}>
                    <Icon file={file} />
                    {label}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
