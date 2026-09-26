import type { ReactNode } from "react"
import { DashboardSidebar } from "./DashboardSidebar"
import { useAuth } from "@/app/providers/AuthContext"
import { useLang } from "@/app/providers/LangContext"

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { lang } = useLang()
  const ar = lang === "ar"

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-[#12243f]">
      <DashboardSidebar />
      <div className="min-h-screen min-w-0" style={{ paddingInlineStart: "var(--sidebar-width)" }}>
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between gap-4 border-b border-[#dce8f2] bg-white/95 px-5 backdrop-blur lg:px-8">
          <label className="flex min-w-0 max-w-xl flex-1 items-center gap-3 rounded-2xl border border-[#dce8f2] bg-[#f8fbfe] px-4 py-2.5">
            <SearchIcon />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-[#8294aa]" placeholder={ar ? "ابحث في الرحلات والعملاء والعروض…" : "Search trips, leads and offers…"} aria-label={ar ? "بحث" : "Search"} />
          </label>
          <div className="flex items-center gap-3">
            <button className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-[#dce8f2] bg-white text-[#47627f] sm:flex" aria-label={ar ? "الإشعارات" : "Notifications"}>
              <BellIcon /><span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ff735c]" />
            </button>
            <div className="hidden text-end sm:block">
              <p className="text-sm font-semibold text-[#12243f]">{ar ? user?.full_name_ar : user?.full_name}</p>
              <p className="text-xs text-[#8294aa]">{ar ? "فريق العمليات" : "Operations team"}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff5ff] text-sm font-bold text-[#0875bd]">{(ar ? user?.full_name_ar : user?.full_name)?.slice(0, 1) ?? "Y"}</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function SearchIcon() {
  return <svg className="h-5 w-5 shrink-0 text-[#6f8aa7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
}
function BellIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" /><path d="M10 21h4" /></svg>
}
