import { NavLink } from "react-router-dom"
import { useLang } from "@/app/providers/LangContext"
import { useAuth } from "@/app/providers/AuthContext"
import { t } from "@/lib/i18n"
import { DASHBOARD_ROUTES } from "@/lib/routes"
import { cx } from "@/lib/utils"

const navItems = [
  { to: DASHBOARD_ROUTES.home, labelKey: "dashboardHome" as const, icon: "⌂" },
  { to: DASHBOARD_ROUTES.offers, labelKey: "dashboardOffers" as const, icon: "✦" },
  { to: DASHBOARD_ROUTES.hotels, labelKey: "dashboardHotels" as const, icon: "▣" },
  { to: DASHBOARD_ROUTES.leads, labelKey: "dashboardLeads" as const, icon: "◎" },
  { to: DASHBOARD_ROUTES.quotes, labelKey: "dashboardQuotes" as const, icon: "▤" },
  { to: DASHBOARD_ROUTES.reports, labelKey: "dashboardReports" as const, icon: "▥" },
  { to: DASHBOARD_ROUTES.team, labelKey: "dashboardTeam" as const, icon: "◉" },
  { to: DASHBOARD_ROUTES.content, label: "Content management", labelAr: "محتوى الموقع", icon: "✎" },
]

export function DashboardSidebar() {
  const { lang } = useLang()
  const { logout } = useAuth()
  const ar = lang === "ar"

  return (
    <aside className="fixed inset-y-0 start-0 z-20 flex flex-col overflow-y-auto bg-[#102b4d] text-white shadow-[8px_0_28px_rgba(15,61,99,0.08)]" style={{ width: "var(--sidebar-width)" }}>
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16b9ed] text-xl font-bold text-white">✈</div>
        <div><p className="text-lg font-bold tracking-tight">يا هلا</p><p className="text-[11px] text-[#a9c8e6]">Market operations</p></div>
      </div>
      <nav className="flex-1 px-3 py-3">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7696b8]">{ar ? "الرئيسية" : "Workspace"}</p>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === DASHBOARD_ROUTES.home} className={({ isActive }) => cx("flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors", isActive ? "bg-[#119ee0] font-semibold text-white shadow-[0_8px_18px_rgba(17,158,224,0.25)]" : "text-[#c5d8eb] hover:bg-white/10 hover:text-white")}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-base">{item.icon}</span>
              <span>{"labelKey" in item ? t(item.labelKey, lang) : (ar ? item.labelAr : item.label)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="m-4 rounded-2xl bg-[linear-gradient(145deg,#0e9ad8,#0874bd)] p-4">
        <p className="text-sm font-semibold">{ar ? "رحلتك القادمة" : "Your next adventure"}</p>
        <p className="mt-1 text-xs leading-5 text-white/75">{ar ? "أدر عروضك وتابع كل طلب من مكان واحد." : "Manage offers and follow every request in one place."}</p>
      </div>
      <button onClick={logout} className="mx-4 mb-5 rounded-xl px-3 py-3 text-start text-sm text-[#c5d8eb] hover:bg-white/10 hover:text-white">{ar ? "تسجيل الخروج" : "Log out"}</button>
    </aside>
  )
}
