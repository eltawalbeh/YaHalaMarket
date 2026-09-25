import { useLang } from '@/app/providers/LangContext';
import { cx } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div className={cx('flex items-center gap-1 text-sm', className)}>
      <button
        onClick={() => setLang('ar')}
        className={cx(
          'px-2 py-1 rounded transition-colors',
          lang === 'ar'
            ? 'bg-[var(--primary)] text-white'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
        )}
        aria-label="Arabic"
      >
        ع
      </button>
      <button
        onClick={() => setLang('en')}
        className={cx(
          'px-2 py-1 rounded transition-colors',
          lang === 'en'
            ? 'bg-[var(--primary)] text-white'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
        )}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
