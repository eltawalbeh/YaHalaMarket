import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useLang } from "@/app/providers/LangContext"
import { useAuth } from "@/app/providers/AuthContext"
import { offersService, leadsService, quotesService } from "@/services"
import { DASHBOARD_ROUTES } from "@/lib/routes"

export default function DashboardHome() {
  const { lang } = useLang()
  const { user } = useAuth()
  const [stats, setStats] = useState({ offers: 0, leads: 0, quotes: 0 })

  useEffect(() => {
    Promise.all([offersService.list(), leadsService.list(), quotesService.list()])
      .then(([offers, leads, quotes]) => setStats({ offers: offers.length, leads: leads.length, quotes: quotes.length }))
  }, [])

  const ar = lang === "ar"
  const greeting = ar ? `مرحباً، ${user?.full_name_ar ?? ""}` : `Welcome, ${user?.full_name ?? ""}`

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">{greeting}</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8">{ar ? "لوحة تحكم العمليات" : "Operations Dashboard"}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"><StatCard label={ar ? "العروض" : "Offers"} value={stats.offers} /><StatCard label={ar ? "العملاء" : "Leads"} value={stats.leads} /><StatCard label={ar ? "أسعار" : "Quotes"} value={stats.quotes} /></div>
      <Card className="mb-6"><div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold">{ar ? "إدارة محتوى الموقع" : "Site content management"}</h2><p className="text-sm text-[var(--muted-foreground)] mt-1">{ar ? "اللوجو، الفوتر، معلومات التواصل والنصوص العامة." : "Logo, footer, contact details and public content."}</p></div><Link to={DASHBOARD_ROUTES.content}><Button size="sm">{ar ? "فتح" : "Open"}</Button></Link></div></Card>
      <Card className="text-center py-12"><p className="text-[var(--muted-foreground)] text-sm">{ar ? "سيتم إضافة الرسوم البيانية والإحصاءات التفصيلية في مرحلة قادمة." : "Charts and detailed statistics will be added in a future phase."}</p></Card>
    </DashboardLayout>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <Card><p className="text-sm text-[var(--muted-foreground)] mb-1">{label}</p><p className="text-3xl font-bold text-[var(--foreground)] numerals-latin">{value}</p></Card>
}
