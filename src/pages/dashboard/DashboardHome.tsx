import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Metrics, LoadingState, Icon } from "@/components/ui/Operations";
import { useAuth } from "@/app/providers/AuthContext";
import { useLang } from "@/app/providers/LangContext";
import { useResource } from "@/lib/request";
import { leadsService, quotesService, offersService } from "@/services";
import { LEAD_STATUSES } from "@/lib/constants";
import { StatusPill } from "@/components/shared/StatusPill";
export default function DashboardHome() {
  const { user } = useAuth();
  const { lang } = useLang();
  const ar = lang === "ar";
  const r = useResource(async () => ({
    leads: await leadsService.list(),
    quotes: await quotesService.list(),
    offers: await offersService.list(),
  }));
  const leads = r.data?.leads || [];
  const quotes = r.data?.quotes || [];
  const offers = r.data?.offers || [];
  const due = leads.filter(
    (l) =>
      l.follow_up_at &&
      new Date(l.follow_up_at) <= new Date() &&
      !["sold", "lost"].includes(l.status),
  );
  const stages = [
    ["new", ar ? "استفسار" : "Enquiry"],
    ["contacted", ar ? "تواصل" : "Contacted"],
    ["quote_sent", ar ? "عرض مرسل" : "Quote sent"],
    ["follow_up", ar ? "متابعة" : "Follow-up"],
    ["sold", ar ? "مؤكد" : "Won"],
  ];
  const counts = stages.map(
    ([s]) => leads.filter((l) => l.status === s).length,
  );
  const max = Math.max(1, ...counts);
  return (
    <DashboardLayout>
      <section className="home-hero">
        <div>
          <p className="text-xs mb-4">
            {new Date().toLocaleDateString(ar ? "ar-JO-u-nu-latn" : "en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="text-3xl mb-3">
            {ar ? "أهلاً، " : "Welcome, "}
            {ar ? user?.full_name_ar || user?.full_name : user?.full_name}
          </h1>
          <p className="text-white/80 text-xs">
            {ar
              ? "لديك " +
                due.length +
                " متابعات مستحقة و" +
                offers.filter((o) => o.status === "in_review").length +
                " عروض تنتظر المراجعة."
              : due.length +
                " follow-ups due and " +
                offers.filter((o) => o.status === "in_review").length +
                " offers awaiting review."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-xl bg-white text-[var(--primary)] px-4 py-3 font-semibold"
            to="/dashboard/quotes"
          >
            {ar ? "إنشاء عرض جديد" : "Create quotation"}
          </Link>
          <Link
            className="rounded-xl border border-white/30 bg-white/10 px-4 py-3"
            to="/dashboard/leads"
          >
            {ar ? "استعراض العملاء" : "Browse leads"}
          </Link>
        </div>
      </section>
      <LoadingState {...r} retry={r.reload} />
      <Metrics
        items={[
          {
            label: ar ? "عروض أسعار مقبولة" : "Accepted quotes",
            value: quotes.filter((q) => q.status === "accepted").length,
            icon: "09a33",
          },
          {
            label: ar ? "عملاء جدد" : "New leads",
            value: leads.filter((l) => l.status === "new").length,
            icon: "dd900",
          },
          {
            label: ar ? "عروض بانتظار الرد" : "Quotes awaiting reply",
            value: quotes.filter(
              (q) =>
                ["sent", "viewed", "under_discussion"].includes(q.status) &&
                q.valid_until >= new Date().toISOString().slice(0, 10),
            ).length,
            icon: "909e5",
          },
          {
            label: ar ? "عروض سفر منشورة" : "Published packages",
            value: offers.filter(
              (o) =>
                o.status === "published" &&
                (!o.expires_at || new Date(o.expires_at) > new Date()),
            ).length,
            icon: "a3951",
          },
        ]}
      />
      <div className="split-content">
        <section className="panel">
          <h2>{ar ? "مسار فرص السفر" : "Travel opportunity stages"}</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {ar
              ? "الحالة الحالية لطلبات العملاء"
              : "Current state of customer requests"}
          </p>
          <div className="bar-chart">
            {stages.map(([status, label], i) => (
              <div key={status}>
                <span>{counts[i]}</span>
                <b
                  style={{
                    height: Math.max(2, (counts[i] / max) * 160),
                    background: [
                      "#209fc1",
                      "#23b6c0",
                      "#238989",
                      "#58c193",
                      "#8bd6b0",
                    ][i],
                  }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Link
              className="rounded-xl bg-[var(--muted)] p-5"
              to="/dashboard/offers"
            >
              {ar ? "عروض قيد المراجعة" : "Packages in review"}
              <strong className="block text-2xl mt-2">
                {offers.filter((o) => o.status === "in_review").length}
              </strong>
            </Link>
            <Link
              className="rounded-xl bg-[var(--muted)] p-5"
              to="/dashboard/reports"
            >
              {ar ? "تقارير الأداء" : "Performance reports"}
              <span className="block mt-2 text-[var(--primary)]">
                {ar ? "عرض التقرير ←" : "View report →"}
              </span>
            </Link>
          </div>
        </section>
        <aside className="panel">
          <div className="flex justify-between gap-2">
            <h2>{ar ? "الطلبات الحديثة" : "Recent enquiries"}</h2>
            <Link
              className="text-xs text-[var(--primary)]"
              to="/dashboard/leads"
            >
              {ar ? "عرض الكل" : "View all"}
            </Link>
          </div>
          {leads.slice(0, 5).map((l) => (
            <Link
              key={l.id}
              to={"/dashboard/leads?search=" + encodeURIComponent(l.full_name)}
              className="flex items-start justify-between gap-2 py-4 border-b border-[var(--border)]"
            >
              <div className="min-w-0">
                <strong className="block truncate">{l.full_name}</strong>
                <p className="text-[10px] text-[var(--muted-foreground)]">
                  {l.reference_id}
                </p>
              </div>
              <StatusPill status={l.status} meta={LEAD_STATUSES} />
            </Link>
          ))}
          {!leads.length && (
            <p className="empty-state">
              {ar ? "لم تصل طلبات بعد." : "No enquiries yet."}
            </p>
          )}
          {due.length > 0 && (
            <Link
              className="flex items-center gap-2 rounded-xl bg-[#fff4dc] p-3 mt-5 text-[#ac812b] text-xs"
              to="/dashboard/leads"
            >
              <Icon file="296b5" />
              {due.length} {ar ? "متابعات مستحقة" : "follow-ups due"}
            </Link>
          )}
        </aside>
      </div>
    </DashboardLayout>
  );
}
