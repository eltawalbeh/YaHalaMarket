import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { useLang } from "@/app/providers/LangContext"
import { useAuth } from "@/app/providers/AuthContext"
import { offersService, leadsService, quotesService } from "@/services"
import { DASHBOARD_ROUTES } from "@/lib/routes"
import type { Lead, Offer } from "@/types"

const destinationPhotos: Record<string, string> = { TR: "photo-1524231757912-21f4fe3a7200", MV: "photo-1573843981267-be1999ff37cd", AE: "photo-1512453979798-5ea266f8880c", JP: "photo-1490806843957-31f4c9a91c65", IT: "photo-1516483638261-f4dbaf036963" }
const fallbackPhoto = "photo-1476514525535-07fb3b4ae5f1"

export default function DashboardHome() {
  const { lang } = useLang()
  const { user } = useAuth()
  const ar = lang === "ar"
  const [offers, setOffers] = useState<Offer[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [counts, setCounts] = useState({ offers: 0, leads: 0, quotes: 0 })
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([offersService.list(), leadsService.list(), quotesService.list()]).then(([offerRows, leadRows, quoteRows]) => {
      setOffers(offerRows); setLeads(leadRows); setCounts({ offers: offerRows.length, leads: leadRows.length, quotes: quoteRows.length })
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load dashboard"))
  }, [])

  const greeting = ar ? user?.full_name_ar || "مرحباً" : user?.full_name || "Welcome"
  const publishedOffers = useMemo(() => offers.filter((offer) => offer.status === "published").slice(0, 4), [offers])
  const recentLeads = leads.slice(0, 4)

  return (
    <DashboardLayout>
      <section className="relative overflow-hidden rounded-[28px] bg-[#087bc1] p-6 text-white shadow-[0_18px_45px_rgba(8,123,193,0.18)] lg:p-9">
        <div className="absolute inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,54,98,0.92),rgba(7,125,194,0.56),rgba(7,125,194,0.18))]" />
        <div className="relative max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a9edff]">{ar ? "لوحة عمليات يا هلا" : "YA HALA OPERATIONS"}</p>
          <h1 className="max-w-xl text-3xl font-bold leading-tight lg:text-5xl">{ar ? "أهلاً، " + greeting : "Welcome back, " + greeting}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">{ar ? "تابع العروض والعملاء وطلبات التسعير من مكان واحد." : "Manage your offers, leads and quote requests from one focused workspace."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={DASHBOARD_ROUTES.offerNew} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0875bd] hover:bg-[#e9f9ff]">{ar ? "إنشاء عرض" : "Create offer"} <span className="ms-1">→</span></Link>
            <Link to={DASHBOARD_ROUTES.leads} className="rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20">{ar ? "عرض العملاء" : "View leads"}</Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label={ar ? "العروض الكلية" : "Total offers"} value={counts.offers} tone="blue" />
        <MetricCard label={ar ? "طلبات العملاء" : "Lead requests"} value={counts.leads} tone="cyan" />
        <MetricCard label={ar ? "طلبات التسعير" : "Quote requests"} value={counts.quotes} tone="violet" />
      </section>

      {error && <p className="mt-4 rounded-xl bg-[#fff1ef] px-4 py-3 text-sm text-[#b94636]">{error}</p>}

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <div className="rounded-2xl border border-[#dce8f2] bg-white p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6f8aa7]">{ar ? "الوجهات" : "Destinations"}</p><h2 className="mt-1 text-xl font-bold text-[#12243f]">{ar ? "العروض المنشورة" : "Published offers"}</h2></div><Link to={DASHBOARD_ROUTES.offers} className="text-sm font-semibold text-[#087bc1] hover:underline">{ar ? "عرض الكل" : "View all"} →</Link></div>
          {publishedOffers.length === 0 ? <EmptyState text={ar ? "لا توجد عروض منشورة حالياً." : "No published offers yet."} link={DASHBOARD_ROUTES.offerNew} action={ar ? "إنشاء أول عرض" : "Create your first offer"} /> : <div className="grid gap-4 sm:grid-cols-2">{publishedOffers.map((offer, index) => <OfferCard key={offer.id} offer={offer} index={index} ar={ar} />)}</div>}
        </div>
        <div className="rounded-2xl border border-[#dce8f2] bg-white p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6f8aa7]">{ar ? "آخر النشاطات" : "Latest activity"}</p><h2 className="mt-1 text-xl font-bold text-[#12243f]">{ar ? "طلبات العملاء" : "Recent leads"}</h2></div><Link to={DASHBOARD_ROUTES.leads} className="text-sm font-semibold text-[#087bc1] hover:underline">→</Link></div>
          {recentLeads.length === 0 ? <EmptyState text={ar ? "لم تصل طلبات جديدة بعد." : "No lead requests yet."} link={DASHBOARD_ROUTES.leads} action={ar ? "فتح العملاء" : "Open leads"} /> : <div className="space-y-3">{recentLeads.map((lead) => <LeadRow key={lead.id} lead={lead} ar={ar} />)}</div>}
        </div>
      </section>
    </DashboardLayout>
  )
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: "blue" | "cyan" | "violet" }) {
  const colors = { blue: "bg-[#eaf5ff] text-[#0875bd]", cyan: "bg-[#e7fbfa] text-[#098e8a]", violet: "bg-[#f1edff] text-[#6d55cf]" }
  return <div className="rounded-2xl border border-[#dce8f2] bg-white p-5"><div className={"mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold " + colors[tone]}>✦</div><p className="text-sm text-[#6f8aa7]">{label}</p><p className="mt-1 text-3xl font-bold text-[#12243f]">{value}</p></div>
}

function OfferCard({ offer, index, ar }: { offer: Offer; index: number; ar: boolean }) {
  const title = ar ? offer.title_ar : offer.title
  const city = ar ? offer.destination.city_ar : offer.destination.city
  const photo = offer.cover_image_url || "https://images.unsplash.com/" + (destinationPhotos[offer.destination.country_code] || fallbackPhoto) + "?w=900&h=520&fit=crop&auto=format"
  return <div className="group overflow-hidden rounded-2xl border border-[#e1ebf3] bg-white"><div className="relative h-32 overflow-hidden bg-[#dff2fb]"><img src={photo} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading={index < 2 ? "eager" : "lazy"} /><span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#0875bd]">{ar ? "منشور" : "Published"}</span></div><div className="p-4"><p className="text-xs text-[#6f8aa7]">{city}</p><h3 className="mt-1 line-clamp-2 text-sm font-bold text-[#12243f]">{title}</h3><p className="mt-3 text-sm font-semibold text-[#0875bd]">{offer.pricing.base_price.toLocaleString()} {offer.pricing.currency}</p></div></div>
}

function LeadRow({ lead, ar }: { lead: Lead; ar: boolean }) {
  return <Link to={DASHBOARD_ROUTES.leads} className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-[#dce8f2] hover:bg-[#f8fbfe]"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e2f3ff] text-sm font-bold text-[#0875bd]">{lead.full_name.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#12243f]">{lead.full_name}</p><p className="mt-0.5 truncate text-xs text-[#8294aa]">{lead.phone}</p></div><span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-[11px] font-semibold text-[#b87913]">{ar ? "جديد" : lead.status.replace("_", " ")}</span></Link>
}

function EmptyState({ text, action, link }: { text: string; action: string; link: string }) {
  return <div className="rounded-xl bg-[#f8fbfe] p-8 text-center"><p className="text-sm text-[#8294aa]">{text}</p><Link to={link} className="mt-3 inline-block text-sm font-semibold text-[#087bc1] hover:underline">{action} →</Link></div>
}
