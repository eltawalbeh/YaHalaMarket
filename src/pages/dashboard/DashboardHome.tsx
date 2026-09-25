import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useLang } from '@/app/providers/LangContext';
import { useAuth } from '@/app/providers/AuthContext';
import { offersService, leadsService, quotesService } from '@/services';

export default function DashboardHome() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [stats, setStats] = useState({ offers: 0, leads: 0, quotes: 0 });

  useEffect(() => {
    Promise.all([
      offersService.list(),
      leadsService.list(),
      quotesService.list(),
    ]).then(([offers, leads, quotes]) => {
      setStats({ offers: offers.length, leads: leads.length, quotes: quotes.length });
    });
  }, []);

  const greeting = lang === 'ar'
    ? `مرحباً، ${user?.full_name_ar ?? ''}`
    : `Welcome, ${user?.full_name ?? ''}`;

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">{greeting}</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8">
        {lang === 'ar' ? 'لوحة تحكم العمليات' : 'Operations Dashboard'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label={lang === 'ar' ? 'العروض' : 'Offers'}  value={stats.offers} />
        <StatCard label={lang === 'ar' ? 'العملاء' : 'Leads'}  value={stats.leads} />
        <StatCard label={lang === 'ar' ? 'أسعار' : 'Quotes'}   value={stats.quotes} />
      </div>

      <Card className="text-center py-12">
        <p className="text-[var(--muted-foreground)] text-sm">
          {lang === 'ar'
            ? 'سيتم إضافة الرسوم البيانية والإحصاءات التفصيلية في مرحلة قادمة.'
            : 'Charts and detailed statistics will be added in a future phase.'}
        </p>
      </Card>
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-[var(--muted-foreground)] mb-1">{label}</p>
      <p className="text-3xl font-bold text-[var(--foreground)] numerals-latin">{value}</p>
    </Card>
  );
}
