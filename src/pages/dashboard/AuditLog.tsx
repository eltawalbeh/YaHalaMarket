import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/app/providers/LangContext';
import { t } from '@/lib/i18n';
import { mockAuditLog } from '@/data';
import { formatDate } from '@/lib/utils';
import type { AuditLogEntry } from '@/types';

export default function AuditLog() {
  const { lang } = useLang();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  useEffect(() => { setEntries(mockAuditLog); }, []);

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-6">{t('dashboardAuditLog', lang)}</h1>

      <Card padding={false}>
        <div className="divide-y divide-[var(--border)]">
          {entries.map((entry) => (
            <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{entry.user_name}</span>
                  {' '}
                  <Badge variant="gray">{entry.action}</Badge>
                  {' '}
                  <span className="text-[var(--muted-foreground)]">{entry.resource_label}</span>
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 numerals-latin">
                  {formatDate(entry.created_at, lang)}
                  {entry.ip_address && ` · ${entry.ip_address}`}
                </p>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
              {t('noResults', lang)}
            </p>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
