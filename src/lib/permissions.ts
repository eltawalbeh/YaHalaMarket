import type { UserRole } from "@/types/user";

export function canAccessDashboardPath(role: UserRole, path: string): boolean {
  if (role === "super_admin") return true;
  if (path.startsWith("/dashboard/team")) return false;
  if (
    path.startsWith("/dashboard/content") ||
    path.startsWith("/dashboard/audit-log")
  )
    return role === "manager";
  if (role === "accounting")
    return [
      "/dashboard/offers",
      "/dashboard/quotes",
      "/dashboard/reports",
      "/dashboard/settings",
    ].includes(path);
  return true;
}
