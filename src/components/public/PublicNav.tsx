import { Link, NavLink } from 'react-router-dom';
import { useLang } from '@/app/providers/LangContext';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { t } from '@/lib/i18n';
import { PUBLIC_ROUTES } from '@/lib/routes';

export function PublicNav() {
  const { lang } = useLang();

  return (
    <header className="sticky top-0 z-30 bg-[var(--card)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to={PUBLIC_ROUTES.market} className="font-bold text-lg text-[var(--primary)] tracking-tight">
          يا هلا
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <NavLink
            to={PUBLIC_ROUTES.market}
            end
            className={({ isActive }) =>
              isActive ? 'text-[var(--primary)] font-medium' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }
          >
            {t('home', lang)}
          </NavLink>
          <NavLink
            to={PUBLIC_ROUTES.offers}
            className={({ isActive }) =>
              isActive ? 'text-[var(--primary)] font-medium' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }
          >
            {t('offers', lang)}
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            to="/login"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
          >
            {t('dashboard', lang)}
          </Link>
        </div>
      </div>
    </header>
  );
}
