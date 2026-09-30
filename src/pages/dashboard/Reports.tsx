import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PageTitle,
  Metrics,
  LoadingState,
  DataTable,
  Field,
} from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/app/providers/LangContext";
import { useResource } from "@/lib/request";
import { leadsService, quotesService } from "@/services";
import { reporting } from "@/lib/reporting";
import { exportCSV } from "@/lib/export";
export default function Reports() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const r = useResource(async () => ({
    leads: await leadsService.list(),
    quotes: await quotesService.list(),
  }));
  const [from, setFrom] = useState(
    new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10),
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("SAR");
  const data = reporting(
    r.data?.leads || [],
    r.data?.quotes || [],
    from,
    to,
    currency,
  );
  const max = Math.max(1, ...data.series.map((s) => s[1]));
  return (
    <DashboardLayout>
      <PageTitle
        title={ar ? "تقارير الأداء" : "Performance reports"}
        subtitle={
          ar
            ? "قيمة عروض الأسعار المقبولة ومصادر الطلبات. القيم لا تمثل دفعات محصلة."
            : "Accepted quotation value and lead sources. Values do not represent collected payments."
        }
      >
        <Button
          variant="secondary"
          onClick={() =>
            exportCSV(
              "accepted-quotes.csv",
              data.accepted.map((q) => ({
                reference: q.id,
                accepted_at: q.accepted_at,
                value: q.total_price,
                currency: q.currency,
                created_at: q.created_at,
              })),
            )
          }
        >
          {ar ? "تصدير CSV" : "Export CSV"}
        </Button>
        <Button onClick={() => window.print()}>
          {ar ? "طباعة / PDF" : "Print / PDF"}
        </Button>
      </PageTitle>
      <div className="filters">
        <Field label={ar ? "من تاريخ" : "From"}>
          <input
            type="date"
            max={to}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label={ar ? "إلى تاريخ" : "To"}>
          <input
            type="date"
            min={from}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
        <Field label={ar ? "العملة" : "Currency"}>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {Array.from(
              new Set([
                "SAR",
                "USD",
                "EUR",
                "AED",
                "JOD",
                ...(r.data?.quotes.map((q) => q.currency) || []),
              ]),
            ).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Button variant="secondary" onClick={r.reload}>
          {ar ? "تحديث البيانات" : "Refresh data"}
        </Button>
      </div>
      <LoadingState {...r} retry={r.reload} />
      <Metrics
        items={[
          {
            label: ar ? "قيمة العروض المقبولة" : "Accepted quote value",
            value: data.value.toLocaleString("en-US"),
            hint: currency,
            icon: "a8288",
          },
          {
            label: ar ? "موافقات خلال الفترة" : "Acceptances in period",
            value: data.accepted.length,
            icon: "09a33",
          },
          {
            label: ar ? "قبول عروض الفترة" : "Period quote acceptance",
            value: data.acceptance.toFixed(1) + "%",
            icon: "4346a",
          },
          {
            label: ar ? "متوسط العرض المقبول" : "Average accepted quote",
            value: (data.accepted.length
              ? data.value / data.accepted.length
              : 0
            ).toLocaleString("en-US", { maximumFractionDigits: 0 }),
            hint: currency,
            icon: "6cc69",
          },
        ]}
      />
      <div className="split-content">
        <section className="panel">
          <h2>{ar ? "قيمة الموافقات شهرياً" : "Monthly accepted value"}</h2>
          {data.series.length ? (
            <div className="bar-chart">
              {data.series.map(([month, value]) => (
                <div key={month}>
                  <span>{value.toLocaleString("en-US")}</span>
                  <b style={{ height: Math.max(2, (value / max) * 170) }} />
                  <span>{month}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {ar
                ? "لا توجد موافقات خلال الفترة المختارة."
                : "No accepted quotes in the selected period."}
            </div>
          )}
          <div className="mt-6">
            <DataTable
              rows={data.accepted}
              rowKey={(q) => q.id}
              columns={[
                {
                  label: ar ? "المرجع" : "Reference",
                  render: (q) => q.id.slice(0, 8),
                },
                {
                  label: ar ? "تاريخ القبول" : "Accepted",
                  render: (q) => q.accepted_at?.slice(0, 10) || "—",
                },
                {
                  label: ar ? "القيمة" : "Value",
                  render: (q) =>
                    q.total_price.toLocaleString("en-US") + " " + q.currency,
                },
              ]}
            />
          </div>
        </section>
        <aside className="panel">
          <h2>{ar ? "مصادر الطلبات" : "Lead sources"}</h2>
          <p className="text-[var(--muted-foreground)] mb-5">
            {data.periodLeads.length}{" "}
            {ar ? "طلباً جديداً في الفترة" : "new requests in period"}
          </p>
          {data.sources.map(([source, count]) => (
            <div key={source} className="mb-5">
              <div className="flex justify-between mb-2">
                <span>{source}</span>
                <strong>{count}</strong>
              </div>
              <div className="h-2 bg-[var(--muted)] rounded-full">
                <div
                  className="h-2 rounded-full bg-[var(--primary)]"
                  style={{
                    width:
                      (count / Math.max(1, data.periodLeads.length)) * 100 +
                      "%",
                  }}
                />
              </div>
            </div>
          ))}
          <div className="bg-[var(--muted)] rounded-xl p-4 mt-6">
            <p>
              {ar
                ? "العملاء الذين تم بيع رحلات لهم من طلبات الفترة"
                : "Won leads created in this period"}
            </p>
            <strong className="text-2xl">{data.won}</strong>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
