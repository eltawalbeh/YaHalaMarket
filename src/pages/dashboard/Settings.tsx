import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardHeader } from "@/components/ui/Card"
import { useLang } from "@/app/providers/LangContext"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { t } from "@/lib/i18n"

export default function Settings() {
  const { lang } = useLang()

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-6">{t("dashboardSettings", lang)}</h1>

      <div className="max-w-lg flex flex-col gap-4">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm">
              {lang === "ar" ? "اللغة" : "Language"}
            </h2>
          </CardHeader>
          <LanguageToggle />
        </Card>

        <Card className="text-center py-10">
          <p className="text-[var(--muted-foreground)] text-sm">
            {lang === "ar"
              ? "إعدادات النظام الإضافية ستُضاف في مرحلة قادمة."
              : "Additional system settings coming in a future phase."}
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
