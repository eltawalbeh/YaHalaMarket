import { useEffect, useMemo, useRef, useState } from "react";
import { offersService, leadsService } from "@/services";
import { errorMessage, useResource } from "@/lib/request";
import { initTelegramMiniApp, telegramStartParam, telegramUser } from "@/lib/telegram";
import type { Offer } from "@/types";

type View = "home" | "offers" | "request" | "success";

export default function TelegramMiniApp() {
  const [view, setView] = useState<View>("home");
  const [selected, setSelected] = useState<Offer | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const submissionKey = useRef(crypto.randomUUID());
  const tgUser = telegramUser();
  const [form, setForm] = useState({
    name: [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(" "),
    phone: "",
    when: "",
    pax: 1,
    budget: "",
    notes: "",
  });
  const offersResource = useResource(() => offersService.list({ status: "published" }), []);

  useEffect(() => {
    const app = initTelegramMiniApp();
    const start = telegramStartParam();
    if (!app || !start) return;
    void offersService.getBySelector(start).then((offer) => {
      if (offer) {
        setSelected(offer);
        setView("request");
      }
    }).catch(() => {});
  }, []);

  const offers = offersResource.data || [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter((o) =>
      [o.title, o.title_ar, o.destination.city, o.destination.city_ar, o.destination.country, o.destination.country_ar]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [offers, search]);

  function requestOffer(offer: Offer | null) {
    setSelected(offer);
    setError("");
    setView("request");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const userLine = tgUser
        ? `Telegram user: ${tgUser.id}${tgUser.username ? " @" + tgUser.username : ""}`
        : "Telegram Mini App";
      const lead = await leadsService.create({
        full_name: form.name.trim(),
        phone: form.phone.trim(),
        email: null,
        status: "new",
        source: "social",
        offer_id: selected?.id || null,
        assigned_to: null,
        notes: [
          "[Source: Telegram Mini App]",
          userLine,
          selected ? "Package: " + selected.title : "Custom trip",
          form.notes.trim(),
        ].filter(Boolean).join("\n"),
        pax_count: form.pax,
        preferred_dates: form.when ? [form.when] : [],
        budget_range: form.budget || null,
        submission_key: submissionKey.current,
      });
      setReference(lead.reference_id || lead.id.slice(0, 8));
      setView("success");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const money = (o: Offer) =>
    `${o.pricing.base_price.toLocaleString("en-US")} ${o.pricing.currency}`;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
        <header className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-[11px] text-[var(--primary)]">YA HALA</p>
            <h1 className="font-bold text-xl">Travel Mini App</h1>
          </div>
          <button
            className="rounded-full border border-[var(--border)] px-3 py-2 text-xs"
            onClick={() => setView("home")}
            type="button"
          >
            الرئيسية
          </button>
        </header>

        {view === "home" && (
          <>
            <section className="rounded-3xl bg-[var(--primary)] text-white p-6 mb-5">
              <p className="text-xs opacity-80 mb-2">أهلاً {tgUser?.first_name || "بك"} 👋</p>
              <h2 className="text-3xl font-bold leading-tight mb-3">وين حاب تسافر؟</h2>
              <p className="text-sm opacity-90">استعرض أحدث عروض يا هلا أو أرسل طلب رحلة مخصصة خلال أقل من دقيقة.</p>
            </section>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button type="button" onClick={() => setView("offers")} className="panel !p-5 text-start">
                <span className="text-2xl">✈️</span>
                <strong className="block mt-3">العروض</strong>
                <small className="text-[var(--muted-foreground)]">الباقات المنشورة حالياً</small>
              </button>
              <button type="button" onClick={() => requestOffer(null)} className="panel !p-5 text-start">
                <span className="text-2xl">🧳</span>
                <strong className="block mt-3">خطط رحلتي</strong>
                <small className="text-[var(--muted-foreground)]">طلب رحلة مخصصة</small>
              </button>
            </div>
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold">أحدث العروض</h2>
                <button type="button" className="text-xs text-[var(--primary)]" onClick={() => setView("offers")}>عرض الكل</button>
              </div>
              <OfferList offers={offers.slice(0, 4)} loading={offersResource.loading} onRequest={requestOffer} money={money} />
            </section>
          </>
        )}

        {view === "offers" && (
          <section>
            <h2 className="text-2xl font-bold mb-2">العروض والباقات</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">العروض المنشورة مباشرة من Ya Hala Market.</p>
            <input
              aria-label="بحث"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن دبي، تركيا، المالديف…"
              className="w-full mb-5"
            />
            {offersResource.error && <p className="text-sm text-red-600 mb-4">{offersResource.error}</p>}
            <OfferList offers={filtered} loading={offersResource.loading} onRequest={requestOffer} money={money} />
          </section>
        )}

        {view === "request" && (
          <section>
            <button type="button" className="text-xs text-[var(--primary)] mb-4" onClick={() => setView(selected ? "offers" : "home")}>← رجوع</button>
            <h2 className="text-2xl font-bold mb-2">{selected ? "اطلب هذه الباقة" : "خطط رحلتك"}</h2>
            {selected && (
              <div className="panel !p-4 mb-5">
                <p className="text-xs text-[var(--muted-foreground)]">{selected.destination.city_ar || selected.destination.city} · {selected.duration_nights} ليالٍ</p>
                <strong className="block my-2">{selected.title_ar || selected.title}</strong>
                <span className="text-[var(--primary)] font-bold">{money(selected)}</span>
              </div>
            )}
            <form className="grid gap-4" onSubmit={submit}>
              <label className="grid gap-1 text-sm">الاسم الكامل<input required minLength={2} maxLength={160} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="grid gap-1 text-sm">رقم واتساب<input required type="tel" dir="ltr" pattern="[+0-9 ()-]{7,25}" placeholder="+966 5X XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm">موعد السفر<input maxLength={160} placeholder="مثلاً نهاية أكتوبر" value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} /></label>
                <label className="grid gap-1 text-sm">المسافرون<input required type="number" min={1} max={100} value={form.pax} onChange={(e) => setForm({ ...form, pax: Number(e.target.value) })} /></label>
              </div>
              <label className="grid gap-1 text-sm">الميزانية التقريبية<input maxLength={100} placeholder="المبلغ والعملة" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></label>
              <label className="grid gap-1 text-sm">ملاحظات<textarea rows={4} maxLength={4000} placeholder="أي تفاصيل تساعد فريقنا…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={busy} className="rounded-xl bg-[var(--primary)] text-white px-4 py-3 font-medium" type="submit">
                {busy ? "جارٍ إرسال الطلب…" : "إرسال الطلب"}
              </button>
              <p className="text-[10px] text-center text-[var(--muted-foreground)]">لا يتم تحصيل أي مبلغ من خلال هذا الطلب.</p>
            </form>
          </section>
        )}

        {view === "success" && (
          <section className="panel !p-7 text-center mt-12">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold">تم تسجيل طلبك</h2>
            <p className="text-sm text-[var(--muted-foreground)] my-4">وصل الطلب إلى نظام Ya Hala Market وسيتمكن الفريق من متابعته من لوحة الـLeads.</p>
            <p className="text-sm">رقم المرجع</p>
            <strong className="block text-2xl my-2" dir="ltr">{reference}</strong>
            <button type="button" className="rounded-xl bg-[var(--primary)] text-white px-5 py-3 mt-5" onClick={() => { submissionKey.current = crypto.randomUUID(); setSelected(null); setReference(""); setView("home"); }}>
              العودة للرئيسية
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

function OfferList({ offers, loading, onRequest, money }: {
  offers: Offer[];
  loading: boolean;
  onRequest: (offer: Offer) => void;
  money: (offer: Offer) => string;
}) {
  if (loading) return <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">جارٍ تحميل العروض…</p>;
  if (!offers.length) return <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">لا توجد عروض مطابقة حالياً.</p>;
  return (
    <div className="grid gap-4">
      {offers.map((offer) => (
        <article key={offer.id} className="panel !p-0 overflow-hidden">
          {offer.cover_image_url && <img src={offer.cover_image_url} alt={offer.title_ar || offer.title} className="w-full h-40 object-cover" loading="lazy" />}
          <div className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">{offer.destination.city_ar || offer.destination.city} · {offer.duration_nights} ليالٍ</p>
            <h3 className="font-bold text-lg my-2">{offer.title_ar || offer.title}</h3>
            <div className="flex items-center justify-between gap-3">
              <strong className="text-[var(--primary)]" dir="ltr">{money(offer)}</strong>
              <button type="button" onClick={() => onRequest(offer)} className="rounded-xl bg-[var(--primary)] text-white px-4 py-2 text-sm">اطلب العرض</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
