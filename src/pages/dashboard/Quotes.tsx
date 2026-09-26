import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card } from "@/components/ui/Card"
import { useLang } from "@/app/providers/LangContext"
import { t } from "@/lib/i18n"

export default function Quotes() {
  const { lang } = useLang()

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-6">{t("dashboardQuotes", lang)}</h1>
      <Card className="text-center py-12">
        <p className="text-[var(--muted-foreground)] text-sm">
          {lang === "ar"
            ? "إدارة عروض الأسعار ستُضاف في مرحلة قادمة."
            : "Quote management will be added in a future phase."}
        </p>
      </Card>
    </DashboardLayout>
  )
}
