import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { useLang } from "@/app/providers/LangContext"
import { t } from "@/lib/i18n"
import { hotelsService } from "@/services"
import type { Hotel } from "@/types"

export default function Hotels() {
  const { lang } = useLang()
  const [hotels, setHotels] = useState<Hotel[]>([])

  useEffect(() => {
    hotelsService.list().then(setHotels)
  }, [])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{t("dashboardHotels", lang)}</h1>
        <Button size="sm">{t("addNew", lang)}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotels.map((hotel) => {
          const name = lang === "ar" ? hotel.name_ar : hotel.name
          const city =
            lang === "ar" ? hotel.destination_city_ar : hotel.destination_city
          return (
            <Card key={hotel.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {city} · {hotel.destination_country_code}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 numerals-latin">
                    {"★".repeat(hotel.stars)}
                    {"☆".repeat(5 - hotel.stars)}
                  </p>
                </div>
                <Badge variant={hotel.is_active ? "green" : "gray"}>
                  {hotel.is_active
                    ? lang === "ar"
                      ? "نشط"
                      : "Active"
                    : lang === "ar"
                      ? "غير نشط"
                      : "Inactive"}
                </Badge>
              </div>
            </Card>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
