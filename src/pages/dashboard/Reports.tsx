import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useLang } from '@/app/providers/LangContext';
import { t } from '@/lib/i18n';

export default function Reports() {
  const { lang } = useLang();
  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-6">{t('dashboardReports', lang)}</h1>
      <Card className="text-center py-12">
        <p className="text-[var(--muted-foreground)] text-sm">
          {lang === 'ar' ? 'لوحة التقارير ستُضاف في مرحلة قادمة.' : 'Reports dashboard coming in a future phase.'}
        </p>
      </Card>
    </DashboardLayout>
  );
}
