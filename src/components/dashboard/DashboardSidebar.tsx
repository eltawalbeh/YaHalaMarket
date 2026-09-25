import { NavLink } from 'react-router-dom';
import { useLang } from '@/app/providers/LangContext';
import { useAuth } from '@/app/providers/AuthContext';
import { t } from '@/lib/i18n';
import { DASHBOARD_ROUTES } from '@/lib/routes';
import { cx } from '@/lib/utils';

interface NavItem {
  to: string;
  labelKey: Parameters<typeof t>[0];
  icon: string;
}

const navItems: NavItem[] = [
  { to: DASHBOARD_ROUTES.home,     labelKey: 'dashboardHome',     icon: '⊞' },
  { to: DASHBOARD_ROUTES.offers,   labelKey: 'dashboardOffers',   icon: '✦' },
  { to: DASHBOARD_ROUTES.hotels,   labelKey: 'dashboardHotels',   icon: '◈' },
  { to: DASHBOARD_ROUTES.leads,    labelKey: 'dashboardLeads',    icon: '◎' },
  { to: DASHBOARD_ROUTES.quotes,   labelKey: 'dashboardQuotes',   icon: '◻' },
  { to: DASHBOARD_ROUTES.reports,  labelKey: 'dashboardReports',  icon: '▦' },
  { to: DASHBOARD_ROUTES.team,     labelKey: 'dashboardTeam',     icon: '◉' },
  { to: DASHBOARD_ROUTES.auditLog, labelKey: 'dashboardAuditLog', icon: '☰' },
  { to: DASHBOARD_ROUTES.settings, labelKey: 'dashboardSettings', icon: '◌' },
];

export function DashboardSidebar() {
  const { lang } = useLang();
  const { user, logout } = useAuth();

  return (
    <aside
      className="sidebar-scroll fixed inset-y-0 start-0 z-20 flex flex-col overflow-y-auto"
      style={{ width: 'var(--sidebar-width)', background: 'var(--sidebar-bg)' }}
    >
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/10">
        <span className="text-lg font-bold" style={{ color: 'var(--sidebar-fg)' }}>
          يا هلا
        </span>
        <span className="text-xs ms-2" style={{ color: 'var(--sidebar-muted)' }}>
          Operations
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ to, labelKey, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === DASHBOARD_ROUTES.home}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm transition-colors',
                isActive
                  ? 'font-medium'
                  : 'hover:bg-white/5',
              )
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--sidebar-active-bg)' : undefined,
              color: isActive ? 'var(--sidebar-active-fg)' : 'var(--sidebar-fg)',
            })}
          >
            <span className="text-base leading-none opacity-70">{icon}</span>
            <span>{t(labelKey, lang)}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs truncate" style={{ color: 'var(--sidebar-fg)' }}>
            {lang === 'ar' ? user.full_name_ar : user.full_name}
          </p>
          <p className="text-xs truncate mb-3" style={{ color: 'var(--sidebar-muted)' }}>
            {user.email}
          </p>
          <button
            onClick={logout}
            className="text-xs hover:underline"
            style={{ color: 'var(--sidebar-muted)' }}
          >
            {t('logout', lang)}
          </button>
        </div>
      )}
    </aside>
  );
}
