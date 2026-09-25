import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/app/providers/LangContext';
import { t } from '@/lib/i18n';
import { LEAD_STATUSES } from '@/lib/constants';
import { leadsService } from '@/services';
import type { Lead } from '@/types';

export default function Leads() {
  const { lang } = useLang();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => { leadsService.list().then(setLeads); }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t('dashboardLeads', lang)}</h1>
      </div>

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
              <th className="text-start px-4 py-3 font-medium hidden sm:table-cell">{lang === 'ar' ? 'الهاتف' : 'Phone'}</th>
              <th className="text-start px-4 py-3 font-medium">{t('status', lang)}</th>
              <th className="text-start px-4 py-3 font-medium hidden md:table-cell">{lang === 'ar' ? 'المصدر' : 'Source'}</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const statusMeta = LEAD_STATUSES[lead.status];
              return (
                <tr key={lead.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition-colors">
                  <td className="px-4 py-3 font-medium">{lead.full_name}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden sm:table-cell numerals-latin">{lead.phone}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusMeta.color as 'green' | 'red' | 'blue' | 'gray'}>
                      {lang === 'ar' ? statusMeta.label_ar : statusMeta.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden md:table-cell">{lead.source}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}
