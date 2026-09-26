import type { ReactNode } from "react"
import { DashboardSidebar } from "./DashboardSidebar"
import { useAuth } from "@/app/providers/AuthContext"
import { useLang } from "@/app/providers/LangContext"

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { lang } = useLang()
  const ar = lang === "ar"
  return (
    <div className="dashboard-theme min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <DashboardSidebar />
      <div className="min-h-screen min-w-0" style={{ paddingInlineStart: "var(--sidebar-width)" }}>
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between gap-4 border-b border-[var(--border)] bg-white/95 px-5 backdrop-blur lg:px-8">
          <label className="flex min-w-0 max-w-xl flex-1 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2.5">
            <span className="text-[var(--muted-foreground)]">⌕</span>
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]" placeholder={ar ? "ابحث في الرحلات والعملاء والعروض…" : "Search trips, leads and offers…"} aria-label={ar ? "بحث" : "Search"} />
          </label>
          <div className="flex items-center gap-3"><div className="hidden text-end sm:block"><p className="text-sm font-semibold">{ar ? user?.full_name_ar : user?.full_name}</p><p className="text-xs text-[var(--muted-foreground)]">{ar ? "فريق العمليات" : "Operations team"}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff5ff] text-sm font-bold text-[#0875bd]">{(ar ? user?.full_name_ar : user?.full_name)?.slice(0, 1) ?? "Y"}</div></div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
