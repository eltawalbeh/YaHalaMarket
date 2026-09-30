import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PageTitle,
  Metrics,
  LoadingState,
  DataTable,
  Field,
  Modal,
  Feedback,
} from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/shared/StatusPill";
import { useLang } from "@/app/providers/LangContext";
import { useAuth } from "@/app/providers/AuthContext";
import {
  quotesService,
  leadsService,
  offersService,
  usersService,
} from "@/services";
import { useResource, errorMessage } from "@/lib/request";
import { QUOTE_STATUSES } from "@/lib/constants";
import { exportCSV } from "@/lib/export";
import type { Quote, QuoteLineItem } from "@/types";
type Form = Omit<Quote, "id" | "token" | "created_at" | "updated_at"> & {
  id?: string;
};
export default function Quotes() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const readOnly = user?.role === "accounting";
  const r = useResource(async () => ({
    quotes: await quotesService.list(),
    leads: await leadsService.list(),
    offers: await offersService.list(),
    users: await usersService.list({ is_active: true }),
  }));
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const quotes = r.data?.quotes || [];
  const leads = r.data?.leads || [];
  const canEdit = (q: Quote) =>
    !readOnly && (user?.role !== "staff" || q.assigned_to === user.id);
  function create(lead_id = "") {
    const lead = leads.find((l) => l.id === lead_id);
    const offer = r.data?.offers.find((o) => o.id === lead?.offer_id);
    setForm({
      lead_id,
      offer_id: lead?.offer_id || null,
      assigned_to: user!.id,
      status: "draft",
      line_items: offer
        ? [
            {
              label: offer.title,
              label_ar: offer.title_ar,
              quantity: lead?.pax_count || 1,
              unit_price: offer.pricing.base_price,
              currency: offer.pricing.currency,
            },
          ]
        : [
            {
              label: "",
              label_ar: "",
              quantity: 1,
              unit_price: 0,
              currency: "SAR",
            },
          ],
      total_price: 0,
      currency: offer?.pricing.currency || "SAR",
      valid_until: new Date(Date.now() + 7 * 86400000)
        .toISOString()
        .slice(0, 10),
      notes: "",
      notes_ar: "",
      sent_at: null,
      viewed_at: null,
      accepted_at: null,
    });
    setError("");
  }
  useEffect(() => {
    const lead = params.get("lead");
    if (lead && r.data && !readOnly) {
      create(lead);
      setParams({}, { replace: true });
    }
  }, [params, r.data]);
  const name = (id: string) =>
    leads.find((l) => l.id === id)?.full_name || id.slice(0, 8);
  const rows = quotes.filter(
    (q) =>
      (!status || q.status === status) &&
      (q.id + " " + name(q.lead_id))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const set = (key: keyof Form, value: unknown) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));
  function item(
    index: number,
    key: keyof QuoteLineItem,
    value: string | number,
  ) {
    setForm((f) =>
      f
        ? {
            ...f,
            line_items: f.line_items.map((line, i) =>
              i === index ? { ...line, [key]: value } : line,
            ),
          }
        : f,
    );
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError("");
    try {
      const { id, ...data } = form;
      data.total_price = data.line_items.reduce(
        (s, l) => s + Math.round(l.quantity * l.unit_price * 100) / 100,
        0,
      );
      const saved = id
        ? await quotesService.update(id, data)
        : await quotesService.create(data);
      setForm(null);
      setMessage(ar ? "تم حفظ عرض السعر." : "Quote saved.");
      await r.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function share(q: Quote) {
    setBusy(true);
    setError("");
    try {
      if (q.status === "draft") await quotesService.updateStatus(q.id, "sent");
      const link = window.location.origin + "/q/" + q.token;
      await navigator.clipboard.writeText(link);
      setMessage(
        ar
          ? "تم نسخ رابط عرض السعر. يمكنك إرساله للعميل."
          : "Quote link copied. Share it with the customer.",
      );
      await r.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const total =
    form?.line_items.reduce(
      (s, l) => s + Math.round(l.quantity * l.unit_price * 100) / 100,
      0,
    ) || 0;
  return (
    <DashboardLayout>
      <PageTitle
        title={ar ? "عروض الأسعار" : "Quotations"}
        subtitle={
          ar
            ? "أنشئ، راجع، وشارك عروض الأسعار وتابع موافقات العملاء."
            : "Create, review and share quotations; track customer responses."
        }
      >
        <Button
          variant="secondary"
          onClick={() =>
            exportCSV(
              "quotes.csv",
              rows.map((q) => ({
                reference: q.id.slice(0, 8),
                customer: name(q.lead_id),
                status: q.status,
                total: q.total_price,
                currency: q.currency,
                valid_until: q.valid_until,
              })),
            )
          }
        >
          {ar ? "تنزيل التقرير" : "Export report"}
        </Button>
        {!readOnly && (
          <Button onClick={() => create()}>
            {ar ? "+ عرض سعر جديد" : "+ New quote"}
          </Button>
        )}
      </PageTitle>
      <Metrics
        items={[
          {
            label: ar ? "إجمالي عروض الأسعار" : "Total quotes",
            value: quotes.length,
            icon: "779e1",
          },
          {
            label: ar ? "بانتظار العميل" : "Awaiting customer",
            value: quotes.filter(
              (q) =>
                ["sent", "viewed", "under_discussion"].includes(q.status) &&
                q.valid_until >= new Date().toISOString().slice(0, 10),
            ).length,
            icon: "909e5",
          },
          {
            label: ar ? "موافقات العملاء" : "Accepted",
            value: quotes.filter((q) => q.status === "accepted").length,
            icon: "09a33",
          },
          {
            label: ar ? "معدل القبول" : "Acceptance rate",
            value:
              Math.round(
                (100 * quotes.filter((q) => q.status === "accepted").length) /
                  Math.max(
                    1,
                    quotes.filter((q) => q.status !== "draft").length,
                  ),
              ) + "%",
            icon: "61322",
          },
        ]}
      />
      <div className="filters">
        <input
          aria-label="Search quotes"
          placeholder={ar ? "رقم العرض أو العميل…" : "Quote ID or customer…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Quote status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{ar ? "كل الحالات" : "All statuses"}</option>
          {Object.entries(QUOTE_STATUSES).map(([v, m]) => (
            <option key={v} value={v}>
              {ar ? m.label_ar : m.label}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={r.reload}>
          {ar ? "تحديث" : "Refresh"}
        </Button>
      </div>
      <Feedback error={!form ? error : ""} message={message} />
      <LoadingState {...r} retry={r.reload} empty={!rows.length} />
      {!r.loading && !r.error && rows.length > 0 && (
        <DataTable
          rows={rows}
          rowKey={(q) => q.id}
          columns={[
            {
              label: ar ? "المرجع" : "Reference",
              render: (q) => q.id.slice(0, 8).toUpperCase(),
            },
            {
              label: ar ? "العميل" : "Customer",
              render: (q) => <strong>{name(q.lead_id)}</strong>,
            },
            {
              label: ar ? "الحالة" : "Status",
              render: (q) => (
                <StatusPill
                  status={
                    q.valid_until < new Date().toISOString().slice(0, 10) &&
                    !["accepted", "withdrawn", "draft"].includes(q.status)
                      ? "expired"
                      : q.status
                  }
                  meta={QUOTE_STATUSES}
                />
              ),
            },
            {
              label: ar ? "القيمة" : "Amount",
              render: (q) => (
                <span dir="ltr">
                  {q.total_price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  {q.currency}
                </span>
              ),
            },
            {
              label: ar ? "الصلاحية" : "Valid until",
              render: (q) => q.valid_until,
            },
            {
              label: ar ? "إجراء" : "Actions",
              render: (q) => (
                <div className="flex gap-3 flex-wrap">
                  {canEdit(q) && q.status !== "accepted" && (
                    <button
                      className="text-[var(--primary)]"
                      onClick={() => {
                        setForm(q);
                        setError("");
                      }}
                    >
                      {ar ? "تعديل" : "Edit"}
                    </button>
                  )}
                  {q.status !== "draft" && q.status !== "withdrawn" && (
                    <a href={"/q/" + q.token} target="_blank" rel="noreferrer">
                      {ar ? "معاينة" : "View"}
                    </a>
                  )}
                  {(q.status !== "draft" || canEdit(q)) &&
                    !["withdrawn", "expired"].includes(q.status) && (
                      <button disabled={busy} onClick={() => share(q)}>
                        {ar ? "نسخ الرابط" : "Copy link"}
                      </button>
                    )}
                </div>
              ),
            },
          ]}
        />
      )}
      {form && (
        <Modal
          title={ar ? "عرض السعر" : "Quotation"}
          onClose={() => !busy && setForm(null)}
        >
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label={ar ? "العميل" : "Customer"}>
                <select
                  required
                  value={form.lead_id}
                  onChange={(e) => set("lead_id", e.target.value)}
                >
                  <option value="">
                    {ar ? "اختر العميل" : "Select customer"}
                  </option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name} · {l.reference_id}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={ar ? "الباقة" : "Package"}>
                <select
                  value={form.offer_id || ""}
                  onChange={(e) => set("offer_id", e.target.value || null)}
                >
                  <option value="">{ar ? "رحلة مخصصة" : "Custom trip"}</option>
                  {r.data?.offers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {ar ? o.title_ar : o.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={ar ? "صالح حتى" : "Valid until"}>
                <input
                  required
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.valid_until}
                  onChange={(e) => set("valid_until", e.target.value)}
                />
              </Field>
              <Field label={ar ? "العملة" : "Currency"}>
                <select
                  value={form.currency}
                  onChange={(e) => {
                    const currency = e.target.value;
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            currency,
                            line_items: f.line_items.map((l) => ({
                              ...l,
                              currency,
                            })),
                          }
                        : f,
                    );
                  }}
                >
                  {["SAR", "USD", "EUR", "AED", "JOD"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label={ar ? "الحالة" : "Status"}>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {Object.entries(QUOTE_STATUSES)
                    .filter(
                      ([key]) =>
                        !["viewed", "accepted", "expired"].includes(key) ||
                        form.status === key,
                    )
                    .map(([v, m]) => (
                      <option key={v} value={v}>
                        {ar ? m.label_ar : m.label}
                      </option>
                    ))}
                </select>
              </Field>
              {user?.role !== "staff" && (
                <Field label={ar ? "الموظف المسؤول" : "Assigned to"}>
                  <select
                    required
                    value={form.assigned_to}
                    onChange={(e) => set("assigned_to", e.target.value)}
                  >
                    {r.data?.users
                      .filter((u) => u.role !== "accounting")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {ar ? u.full_name_ar || u.full_name : u.full_name}
                        </option>
                      ))}
                  </select>
                </Field>
              )}
            </div>
            <h3 className="font-bold mt-6 mb-3">
              {ar ? "بنود عرض السعر" : "Line items"}
            </h3>
            {form.line_items.map((l, i) => (
              <div
                key={i}
                className="border border-[var(--border)] rounded-xl p-4 mb-3"
              >
                <div className="form-grid">
                  <Field label="Description">
                    <input
                      required
                      value={l.label}
                      onChange={(e) => item(i, "label", e.target.value)}
                    />
                  </Field>
                  <Field label="الوصف بالعربية">
                    <input
                      value={l.label_ar}
                      onChange={(e) => item(i, "label_ar", e.target.value)}
                    />
                  </Field>
                  <Field label={ar ? "الكمية" : "Quantity"}>
                    <input
                      required
                      type="number"
                      min={1}
                      max={1000}
                      value={l.quantity}
                      onChange={(e) =>
                        item(i, "quantity", Number(e.target.value))
                      }
                    />
                  </Field>
                  <Field label={ar ? "سعر الوحدة" : "Unit price"}>
                    <input
                      required
                      type="number"
                      min={0}
                      step="0.01"
                      value={l.unit_price}
                      onChange={(e) =>
                        item(i, "unit_price", Number(e.target.value))
                      }
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  className="mt-3 text-red-600 text-xs"
                  onClick={() =>
                    set(
                      "line_items",
                      form.line_items.filter((_, n) => n !== i),
                    )
                  }
                >
                  {ar ? "حذف البند" : "Remove item"}
                </button>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={() =>
                set("line_items", [
                  ...form.line_items,
                  {
                    label: "",
                    label_ar: "",
                    quantity: 1,
                    unit_price: 0,
                    currency: form.currency,
                  },
                ])
              }
            >
              {ar ? "+ إضافة بند" : "+ Add item"}
            </Button>
            <p className="text-xl font-bold my-5">
              {ar ? "الإجمالي: " : "Total: "}
              {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
              {form.currency}
            </p>
            <div className="form-grid">
              <Field label="Customer notes (English)">
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </Field>
              <Field label="ملاحظات تظهر للعميل">
                <textarea
                  value={form.notes_ar}
                  onChange={(e) => set("notes_ar", e.target.value)}
                />
              </Field>
            </div>
            <Feedback error={error} />
            <div className="form-actions">
              <Button type="submit" disabled={busy || !form.line_items.length}>
                {busy ? "…" : ar ? "حفظ عرض السعر" : "Save quotation"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
