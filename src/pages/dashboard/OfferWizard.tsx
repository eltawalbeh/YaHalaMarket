import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLang } from '@/app/providers/LangContext';
import { DASHBOARD_ROUTES } from '@/lib/routes';
import { offersService } from '@/services';

const STEPS = ['basics', 'pricing', 'details', 'review'] as const;
type Step = (typeof STEPS)[number];

const LABELS: Record<Step, { ar: string; en: string }> = {
  basics: { ar: 'الأساسيات', en: 'Basics' },
  pricing: { ar: 'التسعير', en: 'Pricing' },
  details: { ar: 'التفاصيل', en: 'Details' },
  review: { ar: 'المراجعة', en: 'Review' },
};

type FormState = {
  title: string; title_ar: string; city: string; city_ar: string;
  country: string; country_ar: string; nights: string; expires_at: string;
  price: string; currency: string; description: string; description_ar: string;
};

const initialForm: FormState = {
  title: '', title_ar: '', city: '', city_ar: '', country: '', country_ar: '',
  nights: '3', expires_at: '', price: '', currency: 'SAR', description: '', description_ar: '',
};

export default function OfferWizard() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('basics');
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const index = STEPS.indexOf(step);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const createDraft = async () => {
    setSaving(true);
    await offersService.create({
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `offer-${Date.now()}`,
      title: form.title, title_ar: form.title_ar, description: form.description, description_ar: form.description_ar,
      status: 'draft',
      destination: { city: form.city, city_ar: form.city_ar, country: form.country, country_ar: form.country_ar, country_code: '' },
      pricing: { base_price: Number(form.price) || 0, currency: form.currency, per_person: true, includes_flights: false, includes_hotel: true, includes_transfers: false },
      duration_nights: Number(form.nights) || 0, departure_dates: [], hotel_ids: [], cover_image_url: null,
      tags: [], tags_ar: [], created_by: 'current-user', reviewed_by: null, published_at: null,
      expires_at: form.expires_at || null,
    });
    setSaving(false);
    navigate(DASHBOARD_ROUTES.offers);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-xl font-bold mb-6">{lang === 'ar' ? 'إضافة عرض جديد' : 'Add new offer'}</h1>
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {STEPS.map((item, itemIndex) => <div key={item} className="flex items-center gap-2 shrink-0"><span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold numerals-latin ${itemIndex <= index ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>{itemIndex + 1}</span><span className="text-sm">{lang === 'ar' ? LABELS[item].ar : LABELS[item].en}</span>{itemIndex < STEPS.length - 1 && <span className="w-6 h-px bg-[var(--border)]" />}</div>)}
        </div>
        <Card>
          {step === 'basics' && <div className="grid gap-4 sm:grid-cols-2"><Field label="Title (English)" value={form.title} onChange={(v) => update('title', v)} /><Field label="العنوان بالعربي" value={form.title_ar} onChange={(v) => update('title_ar', v)} /><Field label="City" value={form.city} onChange={(v) => update('city', v)} /><Field label="المدينة" value={form.city_ar} onChange={(v) => update('city_ar', v)} /><Field label="Country" value={form.country} onChange={(v) => update('country', v)} /><Field label="الدولة" value={form.country_ar} onChange={(v) => update('country_ar', v)} /><Field label={lang === 'ar' ? 'عدد الليالي' : 'Nights'} type="number" value={form.nights} onChange={(v) => update('nights', v)} /><Field label={lang === 'ar' ? 'تاريخ انتهاء العرض' : 'Offer expiry'} type="date" value={form.expires_at} onChange={(v) => update('expires_at', v)} /></div>}
          {step === 'pricing' && <div className="grid gap-4 sm:grid-cols-2"><Field label={lang === 'ar' ? 'السعر' : 'Price'} type="number" value={form.price} onChange={(v) => update('price', v)} /><Field label={lang === 'ar' ? 'العملة' : 'Currency'} value={form.currency} onChange={(v) => update('currency', v)} /></div>}
          {step === 'details' && <div className="grid gap-4"><Field label="Description (English)" multiline value={form.description} onChange={(v) => update('description', v)} /><Field label="الوصف بالعربي" multiline value={form.description_ar} onChange={(v) => update('description_ar', v)} /><p className="text-sm text-[var(--muted-foreground)]">{lang === 'ar' ? 'سيتم ربط الفنادق والصور والمستندات في المرحلة التالية.' : 'Hotels, images and documents will be connected in the next phase.'}</p></div>}
          {step === 'review' && <div className="space-y-3 text-sm"><p><strong>{lang === 'ar' ? 'العنوان' : 'Title'}:</strong> {form.title_ar || form.title}</p><p><strong>{lang === 'ar' ? 'الوجهة' : 'Destination'}:</strong> {form.city_ar || form.city}, {form.country_ar || form.country}</p><p><strong>{lang === 'ar' ? 'السعر' : 'Price'}:</strong> {form.price || '0'} {form.currency}</p><p className="text-[var(--muted-foreground)]">{lang === 'ar' ? 'سيتم حفظ العرض كمسودة.' : 'The offer will be saved as a draft.'}</p></div>}
        </Card>
        <div className="flex justify-between mt-4"><Button variant="secondary" onClick={() => index === 0 ? navigate(DASHBOARD_ROUTES.offers) : setStep(STEPS[index - 1])}>{lang === 'ar' ? 'السابق' : 'Back'}</Button>{index < STEPS.length - 1 ? <Button onClick={() => setStep(STEPS[index + 1])}>{lang === 'ar' ? 'التالي' : 'Next'}</Button> : <Button disabled={saving} onClick={createDraft}>{saving ? (lang === 'ar' ? 'جارٍ الحفظ…' : 'Saving…') : (lang === 'ar' ? 'حفظ كمسودة' : 'Save draft')}</Button>}</div>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, value, onChange, type = 'text', multiline = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; multiline?: boolean }) {
  const className = "w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";
  return <label className="grid gap-1.5 text-sm font-medium">{label}{multiline ? <textarea rows={5} value={value} onChange={(event) => onChange(event.target.value)} className={className} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={className} />}</label>;
}
