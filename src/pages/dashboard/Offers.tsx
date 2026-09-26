import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { useLang } from "@/app/providers/LangContext"
import { t } from "@/lib/i18n"
import { OFFER_STATUSES } from "@/lib/constants"
import { DASHBOARD_ROUTES } from "@/lib/routes"
import { offersService } from "@/services"
import { formatPrice } from "@/lib/utils"
import type { Offer } from "@/types"

export default function Offers() {
  const { lang } = useLang()
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    offersService.list().then(setOffers)
  }, [])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t("dashboardOffers", lang)}</h1>
        <Link to={DASHBOARD_ROUTES.offerNew}>
          <Button size="sm">{t("addNew", lang)}</Button>
        </Link>
      </div>

      <Card padding={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
              <th className="text-start px-4 py-3 font-medium">
                {lang === "ar" ? "العنوان" : "Title"}
              </th>
              <th className="text-start px-4 py-3 font-medium hidden sm:table-cell">
                {lang === "ar" ? "الوجهة" : "Destination"}
              </th>
              <th className="text-start px-4 py-3 font-medium">
                {t("status", lang)}
              </th>
              <th className="text-start px-4 py-3 font-medium hidden md:table-cell">
                {lang === "ar" ? "السعر" : "Price"}
              </th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const statusMeta = OFFER_STATUSES[offer.status]
              const title = lang === "ar" ? offer.title_ar : offer.title
              const city =
                lang === "ar"
                  ? offer.destination.city_ar
                  : offer.destination.city
              return (
                <tr
                  key={offer.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{title}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden sm:table-cell">
                    {city}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusMeta.color as "green" | "gray" | "yellow" | "red"
                      }
                    >
                      {lang === "ar" ? statusMeta.label_ar : statusMeta.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 numerals-latin hidden md:table-cell">
                    {formatPrice(
                      offer.pricing.base_price,
                      offer.pricing.currency,
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  )
}
