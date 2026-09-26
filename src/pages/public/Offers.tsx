import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { PublicLayout } from "@/components/public/PublicLayout"
import { useLang } from "@/app/providers/LangContext"
import { offersService } from "@/services"
import { formatPrice } from "@/lib/utils"
import { PUBLIC_ROUTES } from "@/lib/routes"
import type { Offer } from "@/types"

// Curated destination-aware images
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

function offerImg(offer: Offer, fallbackIndex: number, w = 800, h = 600) {
  const id =
    DESTINATION_PHOTOS[offer.destination.country_code] ??
    FALLBACK_PHOTOS[fallbackIndex % FALLBACK_PHOTOS.length]
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`
}

const FILTER_TAGS = [
  { key: "all", en: "All trips", ar: "جميع الرحلات" },
  { key: "luxury", en: "Luxury", ar: "فاخر" },
  { key: "beach", en: "Beach", ar: "شاطئ" },
  { key: "culture", en: "Culture", ar: "ثقافة" },
  { key: "nature", en: "Nature", ar: "طبيعة" },
  { key: "city-break", en: "City break", ar: "جولة مدينة" },
]

export default function Offers() {
  const { lang } = useLang()
  const ar = lang === "ar"
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState("all")

  useEffect(() => {
    offersService.list({ status: "published" }).then((data) => {
      setOffers(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(
    () =>
      activeTag === "all"
        ? offers
        : offers.filter((o) => o.tags.includes(activeTag)),
    [offers, activeTag],
  )

  const featured = filtered[0] ?? null
  const rest = filtered.slice(1)

  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="pt-4 pb-10 lg:pt-8 lg:pb-14">
        <div className="flex items-baseline justify-between gap-4 mb-8">
          <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--muted-foreground)]">
            {ar ? "يا هلا · الرحلات" : "Ya Hala · Trips"}
          </span>
          {!loading && (
            <span
              className="font-mono text-[11px] text-[var(--muted-foreground)] tabular-nums"
              aria-live="polite"
            >
              {filtered.length.toString().padStart(2, "0")}{" "}
              {ar ? "رحلة" : "trips"}
            </span>
          )}
        </div>

        {/* Thin accent rule */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-0.5 bg-[var(--accent)]" />
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-medium leading-[1.07] tracking-tight max-w-3xl mb-6">
          {ar
            ? "رحلات مُصمَّمة\nللفضوليين."
            : "Trips designed\nfor the curious."}
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          {ar
            ? "وجهات مختارة بعناية، برامج متكاملة تشمل الفندق والنقل وكل التفاصيل — أو صمّم رحلتك الخاصة."
            : "Carefully curated destinations with fully crafted itineraries. Hotel, transfers, and every detail handled — or build your own."}
        </p>
      </div>

      {/* ── Filter bar ───────────────────────────────────────── */}
      <div className="border-y border-[var(--border)] py-0 overflow-x-auto scrollbar-none">
        <div className="flex items-stretch min-w-max">
          {FILTER_TAGS.map((tag, i) => {
            const active = activeTag === tag.key
            return (
              <button
                key={tag.key}
                onClick={() => setActiveTag(tag.key)}
                className={[
                  "relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
                  active
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                  i > 0 ? "border-s border-[var(--border)]" : "",
                ].join(" ")}
              >
                {ar ? tag.ar : tag.en}
                {active && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--primary)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      {loading ? (
        <div className="py-16 space-y-12">
          {/* Featured skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] overflow-hidden">
            <div className="aspect-[16/10] lg:min-h-[400px] bg-[var(--muted)] animate-pulse" />
            <div className="bg-[var(--secondary)] p-8 lg:p-12 space-y-4 animate-pulse">
              <div className="h-2.5 w-28 bg-[var(--muted)] rounded" />
              <div className="h-7 w-4/5 bg-[var(--muted)] rounded" />
              <div className="h-7 w-3/5 bg-[var(--muted)] rounded" />
              <div className="h-4 w-full bg-[var(--muted)] rounded mt-4" />
              <div className="h-4 w-5/6 bg-[var(--muted)] rounded" />
            </div>
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[1, 2].map((n) => (
              <div key={n} className="space-y-4 animate-pulse">
                <div className="aspect-[4/3] bg-[var(--muted)] rounded-sm" />
                <div className="h-2.5 w-32 bg-[var(--muted)] rounded" />
                <div className="h-5 w-4/5 bg-[var(--muted)] rounded" />
                <div className="h-px bg-[var(--border)]" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-28 text-center">
          <p className="font-display text-2xl text-[var(--muted-foreground)] mb-3">
            {ar ? "لا توجد رحلات في هذه الفئة" : "No trips in this category"}
          </p>
          <button
            onClick={() => setActiveTag("all")}
            className="text-sm text-[var(--primary)] underline underline-offset-4"
          >
            {ar ? "عرض جميع الرحلات" : "Show all trips"}
          </button>
        </div>
      ) : (
        <div className="py-12 lg:py-16 space-y-16 lg:space-y-24">
          {/* ── Featured card ──────────────────────────── */}
          {featured && (
            <Link
              to={PUBLIC_ROUTES.offerDetail(featured.slug)}
              className="group grid grid-cols-1 lg:grid-cols-[58fr_42fr] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500"
              aria-label={ar ? featured.title_ar : featured.title}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px] overflow-hidden bg-[var(--muted)]">
                <img
                  src={offerImg(featured, 0, 1200, 800)}
                  alt=""
                  className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {/* Gradient overlay bottom */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
                {/* Duration badge */}
                <div className="absolute bottom-5 start-5">
                  <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]">
                    {featured.duration_nights} {ar ? "ليالٍ" : "nights"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-[var(--secondary)] border-s-4 border-[var(--primary)] p-8 lg:p-12 flex flex-col justify-between min-h-[260px] lg:min-h-0">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-5">
                    {ar
                      ? featured.destination.country_ar
                      : featured.destination.country}{" "}
                    ·{" "}
                    {ar
                      ? featured.destination.city_ar
                      : featured.destination.city}
                  </p>
                  <h2 className="font-display text-3xl lg:text-[2.25rem] font-medium leading-[1.12] text-[var(--foreground)] mb-5 group-hover:text-[var(--primary)] transition-colors duration-300">
                    {ar ? featured.title_ar : featured.title}
                  </h2>
                  <p className="text-[var(--muted-foreground)] text-sm leading-relaxed line-clamp-3">
                    {ar ? featured.description_ar : featured.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--border)] flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] text-[var(--muted-foreground)] uppercase tracking-wide mb-1">
                      {ar ? "ابتداءً من" : "from"}
                    </p>
                    <p className="text-2xl font-medium text-[var(--foreground)] numerals-latin">
                      {formatPrice(
                        featured.pricing.base_price,
                        featured.pricing.currency,
                      )}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                      {ar ? "للشخص الواحد" : "per person"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
                    {ar ? "اكتشف الرحلة" : "Explore trip"}
                    <span
                      dir="ltr"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* ── Rest of trips ──────────────────────────── */}
          {rest.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-10">
                <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--muted-foreground)]">
                  {ar ? "المزيد من الرحلات" : "More trips"}
                </span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {rest.map((offer, i) => {
                  const title = ar ? offer.title_ar : offer.title
                  const city = ar
                    ? offer.destination.city_ar
                    : offer.destination.city
                  const country = ar
                    ? offer.destination.country_ar
                    : offer.destination.country

                  return (
                    <div key={offer.id} className="group">
                      <Link
                        to={PUBLIC_ROUTES.offerDetail(offer.slug)}
                        className="block"
                      >
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted)] mb-5">
                          <img
                            src={offerImg(offer, i + 1)}
                            alt={title}
                            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                            loading="lazy"
                          />
                          {/* Duration chip */}
                          <div className="absolute bottom-3 end-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase">
                              {offer.duration_nights}{" "}
                              {ar ? "ليالٍ" : "nights"}
                            </span>
                          </div>
                        </div>

                        {/* Meta */}
                        <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-2.5">
                          {city}, {country}
                        </p>

                        {/* Title */}
                        <h2 className="font-display text-xl font-medium leading-snug mb-5 text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-300">
                          {title}
                        </h2>

                        {/* Price row */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {ar ? "من" : "from"}{" "}
                            <span className="font-medium text-[var(--foreground)] numerals-latin">
                              {formatPrice(
                                offer.pricing.base_price,
                                offer.pricing.currency,
                              )}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)]">
                            {ar ? "تفاصيل" : "Details"}
                            <span
                              dir="ltr"
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            >
                              →
                            </span>
                          </span>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <div className="border-t border-[var(--border)] py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-0.5 bg-[var(--accent)]" />
              <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--muted-foreground)]">
                {ar ? "رحلات خاصة" : "Private travel"}
              </span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-medium leading-tight mb-4">
              {ar
                ? "أخبرنا إلى أين\nتريد الذهاب."
                : "Tell us where\nyou want to go."}
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed max-w-sm">
              {ar
                ? "نُصمّم رحلات خاصة بمواعيدك وميزانيتك وذوقك الشخصي. تواصل معنا للبدء."
                : "We design private trips around your exact dates, budget, and taste. Get in touch to start planning."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start gap-4">
            <Link
              to={PUBLIC_ROUTES.market}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:bg-[var(--brand-teal-light)] transition-colors duration-200"
            >
              {ar ? "تواصل معنا" : "Get in touch"}
              <span
                dir="ltr"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              to={PUBLIC_ROUTES.offers}
              className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors duration-200"
            >
              {ar ? "تصفح جميع الرحلات" : "Browse all trips"}
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
