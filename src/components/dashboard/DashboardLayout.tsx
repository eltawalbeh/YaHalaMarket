import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { useAuth } from "@/app/providers/AuthContext";
import { useLang } from "@/app/providers/LangContext";
import { USER_ROLES } from "@/lib/constants";
import { offersService, leadsService } from "@/services";
import { Icon } from "@/components/ui/Operations";
export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const ar = lang === "ar";
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ label: string; to: string }[]>([]);
  const [searchError, setSearchError] = useState(false);
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      Promise.all([
        offersService.list(),
        user?.role === "accounting" ? Promise.resolve([]) : leadsService.list(),
      ])
        .then(([offers, leads]) => {
          if (!active) return;
          const q = search.toLowerCase();
          setSearchError(false);
          setResults([
            ...offers
              .filter((o) =>
                (o.title + " " + o.title_ar + " " + o.destination.city)
                  .toLowerCase()
                  .includes(q),
              )
              .slice(0, 5)
              .map((o) => ({
                label: ar ? o.title_ar : o.title,
                to:
                  "/dashboard/offers?search=" +
                  encodeURIComponent(ar ? o.title_ar : o.title),
              })),
            ...leads
              .filter((l) =>
                (l.full_name + " " + l.phone + " " + l.reference_id)
                  .toLowerCase()
                  .includes(q),
              )
              .slice(0, 5)
              .map((l) => ({
                label: l.full_name,
                to:
                  "/dashboard/leads?search=" + encodeURIComponent(l.full_name),
              })),
          ]);
        })
        .catch(() => {
          if (active) setSearchError(true);
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, ar, user?.role]);
  return (
    <div className="dashboard-theme">
      <DashboardSidebar />
      <div className="dashboard-body">
        <header className="dashboard-topbar">
          <div className="global-search">
            <Icon file="a49e4" className="absolute left-3 top-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={ar ? "بحث شامل" : "Search all"}
              placeholder={
                ar
                  ? "ابحث عن عميل، عرض أو رقم مرجعي…"
                  : "Search offers, leads or reference…"
              }
              dir={ar ? "rtl" : "ltr"}
            />
            {search.length >= 2 && (
              <div className="global-results" dir={ar ? "rtl" : "ltr"}>
                {searchError ? (
                  <p>{ar ? "تعذر البحث" : "Search failed"}</p>
                ) : results.length ? (
                  results.map((r) => (
                    <Link key={r.to} to={r.to} onClick={() => setSearch("")}>
                      {r.label}
                    </Link>
                  ))
                ) : (
                  <p className="p-2 text-xs">
                    {ar ? "لا توجد نتائج" : "No results"}
                  </p>
                )}
              </div>
            )}
          </div>
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3"
            dir={ar ? "rtl" : "ltr"}
          >
            <div className="rounded-full w-10 h-10 bg-gradient-to-r from-[#0d95c7] to-[#16b8c6] text-white flex items-center justify-center font-bold">
              {(ar
                ? user?.full_name_ar || user?.full_name
                : user?.full_name
              )?.slice(0, 2)}
            </div>
            <div className="hidden sm:block">
              <strong className="text-xs">
                {ar ? user?.full_name_ar || user?.full_name : user?.full_name}
              </strong>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                {user &&
                  (ar
                    ? USER_ROLES[user.role].label_ar
                    : USER_ROLES[user.role].label)}
              </p>
            </div>
          </Link>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
