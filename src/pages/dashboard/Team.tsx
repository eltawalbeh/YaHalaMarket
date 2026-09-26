import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useLang } from "@/app/providers/LangContext"
import { t } from "@/lib/i18n"
import { USER_ROLES } from "@/lib/constants"
import { usersService } from "@/services"
import type { User } from "@/types"

export default function Team() {
  const { lang } = useLang()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    usersService.list().then(setUsers)
  }, [])

  return (
    <DashboardLayout>
      <h1 className="text-xl font-bold mb-6">{t("dashboardTeam", lang)}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const roleMeta = USER_ROLES[user.role]
          return (
            <Card key={user.id}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                  {(lang === "ar" ? user.full_name_ar : user.full_name).charAt(
                    0,
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {lang === "ar" ? user.full_name_ar : user.full_name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="teal">
                  {lang === "ar" ? roleMeta.label_ar : roleMeta.label}
                </Badge>
              </div>
            </Card>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
