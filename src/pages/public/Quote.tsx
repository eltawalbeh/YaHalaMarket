import { useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/public/PublicLayout';
import { useLang } from '@/app/providers/LangContext';

export default function Quote() {
  const { token } = useParams<{ token: string }>();
  const { lang } = useLang();

  return (
    <PublicLayout>
      <div className="max-w-lg mx-auto py-12 text-center">
        <p className="text-sm text-[var(--muted-foreground)] mb-2">
          {lang === 'ar' ? 'عرض سعر' : 'Quote'}
        </p>
        <h1 className="text-2xl font-bold mb-6">
          {lang === 'ar' ? 'عرض سعرك الخاص' : 'Your personalised quote'}
        </h1>
        <div className="border border-[var(--border)] rounded-[var(--radius)] p-8 bg-[var(--card)]">
          <p className="text-xs text-[var(--muted-foreground)] font-mono mb-4 numerals-latin">{token}</p>
          <p className="text-[var(--muted-foreground)] text-sm">
            {lang === 'ar'
              ? 'سيتم عرض تفاصيل عرض السعر هنا في المرحلة القادمة.'
              : 'Quote details will appear here in the next phase.'}
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
