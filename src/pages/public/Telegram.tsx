import { FormEvent, useEffect, useMemo, useState } from "react";
import { AirplaneTilt, CheckCircle, PaperPlaneTilt, ShieldCheck } from "@phosphor-icons/react";
import { offersService } from "@/services";
import { errorMessage, useResource } from "@/lib/request";
import { getTelegramWebApp } from "@/lib/telegram";
import { supabase } from "@/lib/supabase/client";
import type { Offer } from "@/types";

const money = (offer: Offer) =>
  new Intl.NumberFormat("en-US").format(offer.pricing.base_price) + ` ${offer.pricing.currency}`;

export default function Telegram() {
  const app = getTelegramWebApp();
  const offers = useResource(() => offersService.list({ status: "published" }), []);
  const [selected, setSelected] = useState<Offer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", dates: "", travellers: 1, notes: "" });
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const customerName = useMemo(() => {
    const user = app?.initDataUnsafe?.user;
    return [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  }, [app]);

  useEffect(() => {
    app?.ready();
    app?.expand();
    if (customerName) setForm((value) => (value.name ? value : { ...value, name: customerName }));
  }, [app, customerName]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!selected || busy) return;
    if (!app?.initData) { setError("Please open this page from the Ya Hala Telegram bot."); return; }
    setBusy(true); setError("");
    app.MainButton.showProgress(true);
    try {
      const { data, error: invokeError } = await supabase!.functions.invoke("telegram-mini-app", {
        body: { initData: app.initData, offerId: selected.id, fullName: form.name, phone: form.phone, dates: form.dates, travellers: form.travellers, notes: form.notes },
      });
      if (invokeError) throw invokeError;
      if (!data?.reference) throw new Error("Could not save your request");
      setReference(data.reference);
      app.MainButton.hide();
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); app.MainButton.hideProgress(); }
  }

  useEffect(() => {
    if (!selected || reference) { app?.MainButton.hide(); return; }
    const handler = () => void submit();
    app?.MainButton.setText("Send request"); app?.MainButton.show(); app?.MainButton.onClick(handler);
    return () => app?.MainButton.offClick(handler);
  }, [selected, reference, form, busy]);

  if (reference) return <main className="min-h-screen bg-[var(--background)] p-5 text-center" dir="rtl"><div className="mx-auto mt-24 max-w-sm rounded-3xl bg-white p-8 shadow-sm"><CheckCircle size={50} className="mx-auto text-emerald-600" weight="fill" /><h1 className="mt-5 text-2xl font-bold">تم إرسال طلبك</h1><p className="mt-3 text-sm text-[var(--muted-foreground)]">رقم المتابعة: <b dir="ltr">{reference}</b></p><p className="mt-4 text-sm">سيتواصل معك فريق يا هلا قريبًا.</p></div></main>;

  return <main className="min-h-screen bg-[var(--background)] pb-28" dir="rtl"><header className="bg-[var(--primary)] px-5 pb-8 pt-7 text-white"><div className="flex items-center gap-3"><AirplaneTilt size={28} weight="fill" /><div><p className="text-xs opacity-80">Ya Hala Travel</p><h1 className="text-xl font-bold">أهلاً {customerName || "بك"}</h1></div></div><p className="mt-5 text-sm leading-6 text-white/80">اختَر عرضًا وأرسل طلبك مباشرة لفريق السفر.</p></header><section className="px-4 pt-5"><h2 className="mb-3 text-lg font-bold">العروض المتاحة</h2>{offers.loading && <p>جارٍ تحميل العروض…</p>}{offers.error && <p className="text-red-600">{offers.error}</p>}<div className="grid gap-3">{offers.data?.map((offer) => <button key={offer.id} type="button" onClick={() => { setSelected(offer); setReference(""); }} className={`rounded-2xl border p-4 text-right ${selected?.id === offer.id ? "border-[var(--primary)] bg-[var(--secondary)]" : "border-black/10 bg-white"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{offer.title_ar || offer.title}</p><p className="mt-1 text-xs text-[var(--muted-foreground)]">{offer.destination.city_ar || offer.destination.city} · {offer.duration_nights} ليالٍ</p></div><b dir="ltr" className="text-sm text-[var(--primary)]">{money(offer)}</b></div></button>)}</div></section>{selected && <section className="mx-4 mt-5 rounded-2xl bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-2"><PaperPlaneTilt size={20} className="text-[var(--primary)]" /><h2 className="font-bold">أرسل طلبك</h2></div><form onSubmit={submit} className="grid gap-3"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل" className="rounded-xl border p-3" /><input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="رقم واتساب" dir="ltr" className="rounded-xl border p-3" /><div className="grid grid-cols-2 gap-3"><input value={form.dates} onChange={(e) => setForm({ ...form, dates: e.target.value })} placeholder="متى السفر؟" className="rounded-xl border p-3" /><input min="1" max="20" type="number" value={form.travellers} onChange={(e) => setForm({ ...form, travellers: Number(e.target.value) })} className="rounded-xl border p-3" /></div><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="أي تفاصيل إضافية؟" rows={3} className="rounded-xl border p-3" />{error && <p className="text-sm text-red-600">{error}</p>}<button type="submit" disabled={busy} className="rounded-xl bg-[var(--primary)] p-3 font-bold text-white">{busy ? "جارٍ الإرسال…" : "إرسال الطلب"}</button></form><p className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><ShieldCheck size={16} /> تُستخدم بياناتك فقط لمتابعة طلبك.</p></section>}</main>;
}
