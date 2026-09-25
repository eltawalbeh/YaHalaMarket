import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLang } from '@/app/providers/LangContext';
import { DASHBOARD_ROUTES } from '@/lib/routes';

const STEPS = ['details', 'pricing', 'hotels', 'review'] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, { ar: string; en: string }> = {
  details: { ar: 'التفاصيل',   en: 'Details' },
  pricing: { ar: 'التسعير',   en: 'Pricing' },
  hotels:  { ar: 'الفنادق',   en: 'Hotels' },
  review:  { ar: 'المراجعة',  en: 'Review' },
};

export default function OfferWizard() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');
  const stepIndex = STEPS.indexOf(step);

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-6">
          {lang === 'ar' ? 'عرض جديد' : 'New Offer'}
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold numerals-latin
                ${i <= stepIndex ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i === stepIndex ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted-foreground)]'}`}>
                {lang === 'ar' ? STEP_LABELS[s].ar : STEP_LABELS[s].en}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-[var(--border)]" />}
            </div>
          ))}
        </div>

        <Card>
          <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">
            {lang === 'ar'
              ? `محتوى خطوة "${STEP_LABELS[step].ar}" سيُضاف في المرحلة القادمة.`
              : `"${STEP_LABELS[step].en}" step content will be added in the next phase.`}
          </p>
        </Card>

        <div className="flex justify-between mt-4">
          <Button
            variant="secondary"
            onClick={() => {
              if (stepIndex === 0) navigate(DASHBOARD_ROUTES.offers);
              else setStep(STEPS[stepIndex - 1]);
            }}
          >
            {lang === 'ar' ? 'السابق' : 'Back'}
          </Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button onClick={() => setStep(STEPS[stepIndex + 1])}>
              {lang === 'ar' ? 'التالي' : 'Next'}
            </Button>
          ) : (
            <Button onClick={() => navigate(DASHBOARD_ROUTES.offers)}>
              {lang === 'ar' ? 'إنشاء العرض' : 'Create Offer'}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
