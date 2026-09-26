import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PublicLayout } from "@/components/public/PublicLayout"
import { useLang } from "@/app/providers/LangContext"
import { offersService } from "@/services"
import { formatPrice } from "@/lib/utils"
import { PUBLIC_ROUTES } from "@/lib/routes"
import type { Offer } from "@/types"

const DESTINATION_PHOTOS: Record<string, string> = {
  TR: "photo-1524231757912-21f4fe3a7200",
  MV: "photo-1573843981267-be1999ff37cd",
  GE: "photo-1469474968028-56623f02e42e",
  AE: "photo-1512453979798-5ea266f8880c",
  JP: "photo-1490806843957-31f4c9a91c65",
  GR: "photo-1555993539-1732b0258235",
  IT: "photo-1516483638261-f4dbaf036963",
  MA: "photo-1539020140153-e479b8b36cc1",
}
const FALLBACK_PHOTOS = [
  "photo-1682685797208-c741d58c2eff",
  "photo-1614088459293-5669fadc3448",
  "photo-1578894381163-e72c17f2d45f",
  "photo-1476514525535-07fb3b4ae5f1",
]

function offerImg(offer: Offer, idx: number) {
  const id =
    DESTINATION_PHOTOS[offer.destination.country_code] ??
    FALLBACK_PHOTOS[idx % FALLBACK_PHOTOS.length]
  return `https://images.unsplash.com/${id}?w=600&h=800&fit=crop&auto=format`
}

function getDifficulty(offer: Offer, ar: boolean) {
  if (offer.tags.some((t) => ["luxury", "honeymoon", "beach"].includes(t)))
    return ar ? "سهل" : "Easy"
  if (offer.duration_nights >= 8) return ar ? "متوسط" : "Moderate"
  return ar ? "سهل" : "Easy"
}

export default function Market() {
  const { lang } = useLang()
  const ar = lang === "ar"
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [destination, setDestination] = useState("all")
  const [tripType, setTripType] = useState("all")

  useEffect(() => {
    offersService.list({ status: "published" }).then((data) => {
      setOffers(data)
      setLoading(false)
    })
  }, [])

  const destinations = useMemo(() => {
    const seen = new Set<string>()
    return offers.filter((o) => {
      if (seen.has(o.destination.country_code)) return false
      seen.add(o.destination.country_code)
      return true
    })
  }, [offers])

  const tripTypes = useMemo(() => {
    const allTags = offers.flatMap((o) => o.tags)
    return [...new Set(allTags)].filter((t) =>
      ["luxury", "beach", "culture", "nature", "city-break"].includes(t),
    )
  }, [offers])

  const filtered = useMemo(() => {
    let result = offers
    if (destination !== "all")
      result = result.filter(
        (o) => o.destination.country_code === destination,
      )
    if (tripType !== "all")
      result = result.filter((o) => o.tags.includes(tripType))
    const q = query.trim().toLowerCase()
    if (q)
      result = result.filter((o) => {
        const title = (ar ? o.title_ar : o.title).toLowerCase()
        const city = (ar
          ? o.destination.city_ar
          : o.destination.city
        ).toLowerCase()
        return title.includes(q) || city.includes(q)
      })
    return result
  }, [offers, destination, tripType, query, ar])

  const hasFilters = query || destination !== "all" || tripType !== "all"

  function clearFilters() {
    setQuery("")
    setDestination("all")
    setTripType("all")
  }

  const TAG_LABELS: Record<string, { en: string; ar: string }> = {
    luxury: { en: "Luxury", ar: "فاخر" },
    beach: { en: "Beach", ar: "شاطئ" },
    culture: { en: "Culture", ar: "ثقافة" },
    nature: { en: "Nature", ar: "طبيعة" },
    "city-break": { en: "City break", ar: "جولة مدينة" },
  }

  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="pt-2 pb-10 lg:pt-4 lg:pb-14">
        <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-medium leading-[1.07] tracking-tight max-w-3xl mb-5">
          {ar
            ? "رحلات مُصمَّمة للفضوليين."
            : "Trips designed for the curious."}
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          {ar
            ? "وجهات مختارة بعناية، برامج متكاملة تشمل الفندق والنقل وكل التفاصيل."
            : "Carefully curated destinations with fully crafted itineraries — hotel, transfers, and every detail handled."}
        </p>
      </div>

      {/* ── Search pill ──────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center h-14 rounded-full border border-[var(--border)] bg-[var(--card)] shadow-sm">
          {/* Search input */}
          <div className="flex items-center gap-2.5 ps-5 flex-1 min-w-0">
            <svg
              className="w-4 h-4 text-[var(--muted-foreground)] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                ar ? "ابحث عن رحلة أو وجهة…" : "Search trips, for example Japan"
              }
              className="flex-1 min-w-0 text-sm bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-[var(--border)] shrink-0" />

          {/* Destination select with chevron */}
          <div className="relative flex items-center shrink-0">
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="appearance-none ps-4 pe-8 h-14 text-sm bg-transparent outline-none text-[var(--foreground)] cursor-pointer font-medium"
              aria-label={ar ? "الوجهة" : "Destination"}
            >
              <option value="all">{ar ? "الكل" : "All"}</option>
              {destinations.map((o) => (
                <option
                  key={o.destination.country_code}
                  value={o.destination.country_code}
                >
                  {ar ? o.destination.country_ar : o.destination.country}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute end-2 w-3.5 h-3.5 text-[var(--muted-foreground)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-[var(--border)] shrink-0" />

          {/* Trip type select with chevron */}
          <div className="relative flex items-center shrink-0">
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
              className="appearance-none ps-4 pe-8 h-14 text-sm bg-transparent outline-none text-[var(--foreground)] cursor-pointer font-medium"
              aria-label={ar ? "نوع الرحلة" : "Trip type"}
            >
              <option value="all">{ar ? "الكل" : "All"}</option>
              {tripTypes.map((tag) => (
                <option key={tag} value={tag}>
                  {ar ? (TAG_LABELS[tag]?.ar ?? tag) : (TAG_LABELS[tag]?.en ?? tag)}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute end-2 w-3.5 h-3.5 text-[var(--muted-foreground)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Clear button */}
          <div className="pe-1.5 ps-2 shrink-0">
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              {ar ? "مسح" : "Clear"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Cards ────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-[var(--muted)] animate-pulse"
              style={{ aspectRatio: "3/4" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-2xl text-[var(--muted-foreground)] mb-4">
            {ar ? "لا توجد رحلات مطابقة" : "No trips found"}
          </p>
          <button
            onClick={clearFilters}
            className="text-sm text-[var(--primary)] underline underline-offset-4"
          >
            {ar ? "عرض جميع الرحلات" : "Show all trips"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
          {filtered.map((offer, i) => (
            <TripCard key={offer.id} offer={offer} index={i} ar={ar} />
          ))}
        </div>
      )}
    </PublicLayout>
  )
}

function TripCard({
  offer,
  index,
  ar,
}: {
  offer: Offer
  index: number
  ar: boolean
}) {
  const title = ar ? offer.title_ar : offer.title
  const location = ar
    ? `${offer.destination.city_ar}، ${offer.destination.country_ar}`
    : `${offer.destination.city}, ${offer.destination.country}`
  const days = offer.duration_nights + 1
  const difficulty = getDifficulty(offer, ar)

  return (
    <Link
      to={PUBLIC_ROUTES.offerDetail(offer.slug)}
      className="group relative block rounded-2xl overflow-hidden bg-[var(--muted)] shadow-sm hover:shadow-xl transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      style={{ aspectRatio: "3/4" }}
    >
      {/* Full-bleed image */}
      <img
        src={offerImg(offer, index)}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        loading={index < 3 ? "eager" : "lazy"}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      {/* Top chips */}
      <div
        className={`absolute top-4 ${ar ? "right-4 flex-row-reverse" : "left-4"} flex gap-2`}
      >
        <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-medium text-[var(--foreground)] leading-snug">
          {days} {ar ? "أيام" : "days"}
        </span>
        <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-medium text-[var(--foreground)] leading-snug">
          {difficulty}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 p-5">
        <p className="text-white/65 text-sm mb-1.5 leading-snug">{location}</p>
        <h2 className="text-white text-[1.2rem] font-bold leading-tight mb-4 line-clamp-2">
          {title}
        </h2>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/90 text-sm">
            {ar ? "من " : "from "}
            <strong className="text-base numerals-latin">
              {formatPrice(offer.pricing.base_price, offer.pricing.currency)}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full px-4 py-2 text-[13px] font-medium shrink-0 group-hover:opacity-90 transition-opacity">
            {ar ? "عرض الرحلة" : "View trip"}
            <span dir="ltr" className="text-sm">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}
