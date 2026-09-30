import { NavLink } from "react-router-dom";
import { useLang } from "@/app/providers/LangContext";
import { useAuth } from "@/app/providers/AuthContext";
import { canAccessDashboardPath } from "@/lib/permissions";
import { Icon } from "@/components/ui/Operations";
const items = [
  ["/dashboard", "نظرة عامة", "Overview", "29e28"],
  ["/dashboard/offers", "العروض", "Offers", "407b7"],
  ["/dashboard/hotels", "الفنادق", "Hotels", "841b7"],
  ["/dashboard/leads", "العملاء المحتملون", "Leads", "f62a4"],
  ["/dashboard/quotes", "عروض الأسعار", "Quotes", "779e1"],
  ["/dashboard/reports", "التقارير", "Reports", "ff452"],
  ["/dashboard/team", "الفريق", "Team", "9d9f7"],
  ["/dashboard/content", "محتوى الموقع", "Site content", "061e3"],
  ["/dashboard/audit-log", "سجل النشاطات", "Audit log", "779e1"],
  ["/dashboard/settings", "إعدادات الحساب", "Settings", "9d9f7"],
];
export function DashboardSidebar() {
  const { lang } = useLang();
  const { user, logout } = useAuth();
  return (
    <aside className="dashboard-sidebar">
      <NavLink to="/" className="flex items-center justify-between gap-3">
        <div className="sidebar-brand-text">
          <strong className="text-xl text-white">يا هلا</strong>
          <p className="text-[10px] mt-1">Market operations</p>
        </div>
        <span className="brand-mark">
          <Icon file="59933" />
        </span>
      </NavLink>
      <nav className="flex-1">
        <p className="sidebar-label text-[10px] opacity-60 mb-4">
          {lang === "ar" ? "مساحة العمليات" : "Workspace"}
        </p>
        <div className="grid gap-1">
          {items
            .filter(([path]) => user && canAccessDashboardPath(user.role, path))
            .map(([path, ar, en, icon]) => (
              <NavLink
                title={lang === "ar" ? ar : en}
                key={path}
                to={path}
                end={path === "/dashboard"}
                className={({ isActive }) =>
                  "sidebar-link " + (isActive ? "active" : "")
                }
              >
                <span className="sidebar-label flex-1">
                  {lang === "ar" ? ar : en}
                </span>
                <span className="sidebar-icon">
                  <Icon file={icon} />
                </span>
              </NavLink>
            ))}
        </div>
      </nav>
      <p className="sidebar-info text-[11px] rounded-2xl border border-white/10 bg-white/5 p-4">
        {lang === "ar"
          ? "إدارة الرحلات والعروض وطلبات العملاء من مكان واحد."
          : "Trips, offers and customer requests in one workspace."}
      </p>
      <button
        type="button"
        onClick={() => void logout()}
        className="sidebar-link"
      >
        <span className="sidebar-label flex-1 text-start">
          {lang === "ar" ? "تسجيل الخروج" : "Sign out"}
        </span>
        <Icon file="e6954" />
      </button>
    </aside>
  );
}
