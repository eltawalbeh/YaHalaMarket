import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { leadsService, usersService, offersService } from "@/services";
import { useResource, errorMessage } from "@/lib/request";
import { LEAD_STATUSES } from "@/lib/constants";
import { exportCSV } from "@/lib/export";
import type { Lead } from "@/types";
const initial: Partial<Lead> = {
  full_name: "",
  phone: "",
  email: "",
  status: "new",
  source: "direct",
  assigned_to: null,
  offer_id: null,
  pax_count: 1,
  notes: "",
  preferred_dates: [],
  budget_range: null,
  follow_up_at: null,
};
export default function Leads() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user } = useAuth();
  const [params] = useSearchParams();
  const r = useResource(async () => ({
    leads: await leadsService.list(),
    users: await usersService.list({ is_active: true }),
    offers: await offersService.list(),
  }));
  const [search, setSearch] = useState(params.get("search") || "");
  const [status, setStatus] = useState("");
  const [assigned, setAssigned] = useState("");
  const [form, setForm] = useState<Partial<Lead> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setSearch(params.get("search") || ""), [params]);
  const leads = r.data?.leads || [];
  const rows = leads.filter(
    (l) =>
      (l.full_name + " " + l.phone + " " + l.reference_id)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!status || status === l.status) &&
      (!assigned || assigned === l.assigned_to),
  );
  const upcoming = leads
    .filter((l) => l.follow_up_at && !["sold", "lost"].includes(l.status))
    .sort((a, b) => a.follow_up_at!.localeCompare(b.follow_up_at!))
    .slice(0, 6);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError("");
    try {
      const data = {
        ...form,
        email: form.email || null,
        phone: form.phone?.trim(),
        full_name: form.full_name?.trim(),
      };
      if (form.id) await leadsService.update(form.id, data);
      else await leadsService.createInternal(data);
      setForm(null);
      await r.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const set = (key: keyof Lead, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));
  return (
    <DashboardLayout>
      <PageTitle
        title={ar ? "العملاء المحتملون" : "Leads"}
        subtitle={
          ar
            ? "رتّب الأولويات، وزّع المتابعات، وتابع الطلب حتى تأكيد الرحلة."
            : "Manage enquiries, assignments and follow-ups."
        }
      >
        <Button
          variant="secondary"
          onClick={() =>
            exportCSV(
              "leads.csv",
              rows.map((l) => ({
                reference: l.reference_id,
                name: l.full_name,
                phone: l.phone,
                email: l.email,
                status: l.status,
                source: l.source,
                travellers: l.pax_count,
                follow_up: l.follow_up_at,
                notes: l.notes,
              })),
            )
          }
        >
          {ar ? "تصدير CSV" : "Export CSV"}
        </Button>
        <Button
          onClick={() => {
            setForm({ ...initial, assigned_to: user?.id });
            setError("");
          }}
        >
          {ar ? "+ إضافة عميل" : "+ Add lead"}
        </Button>
      </PageTitle>
      <Metrics
        items={[
          {
            label: ar ? "العملاء النشطون" : "Active leads",
            value: leads.filter((l) => !["sold", "lost"].includes(l.status))
              .length,
            icon: "ea6d9",
          },
          {
            label: ar ? "المتابعات المستحقة" : "Due follow-ups",
            value: upcoming.filter(
              (l) => new Date(l.follow_up_at!) <= new Date(),
            ).length,
            icon: "e1914",
          },
          {
            label: ar ? "طلبات جديدة" : "New enquiries",
            value: leads.filter((l) => l.status === "new").length,
            icon: "7e1a2",
          },
          {
            label: ar ? "تم البيع" : "Won leads",
            value: leads.filter((l) => l.status === "sold").length,
            icon: "61322",
          },
        ]}
      />
      <div className="filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            ar ? "اسم أو رقم هاتف أو مرجع…" : "Name, phone or reference…"
          }
          aria-label="Search leads"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Status"
        >
          <option value="">{ar ? "كل الحالات" : "All statuses"}</option>
          {Object.entries(LEAD_STATUSES).map(([v, m]) => (
            <option key={v} value={v}>
              {ar ? m.label_ar : m.label}
            </option>
          ))}
        </select>
        <select
          value={assigned}
          onChange={(e) => setAssigned(e.target.value)}
          aria-label="Assignee"
        >
          <option value="">{ar ? "كل الموظفين" : "All staff"}</option>
          {r.data?.users.map((u) => (
            <option key={u.id} value={u.id}>
              {ar ? u.full_name_ar || u.full_name : u.full_name}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={r.reload}>
          {ar ? "تحديث" : "Refresh"}
        </Button>
      </div>
      <LoadingState {...r} retry={r.reload} empty={!rows.length} />
      {!r.loading && !r.error && (
        <div className="split-content">
          <DataTable
            rows={rows}
            rowKey={(l) => l.id}
            columns={[
              {
                label: ar ? "العميل" : "Customer",
                render: (l) => (
                  <div>
                    <strong>{l.full_name}</strong>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      {l.reference_id}
                    </p>
                  </div>
                ),
              },
              {
                label: ar ? "الهاتف" : "Phone",
                render: (l) => (
                  <a dir="ltr" href={"tel:" + l.phone}>
                    {l.phone}
                  </a>
                ),
              },
              {
                label: ar ? "الحالة" : "Status",
                render: (l) => (
                  <StatusPill status={l.status} meta={LEAD_STATUSES} />
                ),
              },
              {
                label: ar ? "المتابعة" : "Follow-up",
                render: (l) =>
                  l.follow_up_at
                    ? new Date(l.follow_up_at).toLocaleString("en-GB", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "—",
              },
              {
                label: ar ? "إجراء" : "Action",
                render: (l) => (
                  <div className="flex gap-3">
                    <button
                      className="text-[var(--primary)]"
                      onClick={() => {
                        setForm(l);
                        setError("");
                      }}
                    >
                      {ar ? "فتح" : "Open"}
                    </button>
                    <Link
                      className="text-[var(--primary)]"
                      to={"/dashboard/quotes?lead=" + l.id}
                    >
                      {ar ? "تسعير" : "Quote"}
                    </Link>
                  </div>
                ),
              },
            ]}
          />
          <aside className="panel">
            <h2>{ar ? "المتابعات القادمة" : "Upcoming follow-ups"}</h2>
            {upcoming.length ? (
              upcoming.map((l) => (
                <button
                  className="block w-full text-start rounded-xl bg-[var(--muted)] p-3 mb-3"
                  key={l.id}
                  onClick={() => setForm(l)}
                >
                  <strong>{l.full_name}</strong>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {new Date(l.follow_up_at!).toLocaleString("en-GB")}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-xs text-[var(--muted-foreground)]">
                {ar ? "لا توجد مواعيد متابعة." : "No scheduled follow-ups."}
              </p>
            )}
          </aside>
        </div>
      )}
      {form && (
        <Modal
          title={ar ? "بيانات العميل" : "Lead details"}
          onClose={() => !busy && setForm(null)}
        >
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label={ar ? "الاسم الكامل" : "Full name"}>
                <input
                  required
                  minLength={2}
                  maxLength={160}
                  value={form.full_name || ""}
                  onChange={(e) => set("full_name", e.target.value)}
                />
              </Field>
              <Field label={ar ? "رقم الهاتف" : "Phone"}>
                <input
                  required
                  type="tel"
                  pattern="[+0-9 ()-]{7,25}"
                  dir="ltr"
                  value={form.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
              <Field label={ar ? "البريد الإلكتروني" : "Email"}>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label={ar ? "الحالة" : "Status"}>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {Object.entries(LEAD_STATUSES).map(([v, m]) => (
                    <option key={v} value={v}>
                      {ar ? m.label_ar : m.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={ar ? "الموظف المسؤول" : "Assigned to"}>
                <select
                  value={form.assigned_to || ""}
                  onChange={(e) => set("assigned_to", e.target.value || null)}
                >
                  <option value="">{ar ? "غير معيّن" : "Unassigned"}</option>
                  {r.data?.users
                    .filter((u) => u.role !== "accounting")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {ar ? u.full_name_ar || u.full_name : u.full_name}
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
              <Field label={ar ? "عدد المسافرين" : "Travellers"}>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={form.pax_count}
                  onChange={(e) => set("pax_count", Number(e.target.value))}
                />
              </Field>
              <Field
                label={
                  ar
                    ? "المتابعة القادمة (توقيت جهازك)"
                    : "Next follow-up (your local time)"
                }
              >
                <input
                  type="datetime-local"
                  value={
                    form.follow_up_at
                      ? new Date(
                          new Date(form.follow_up_at).getTime() -
                            new Date(form.follow_up_at).getTimezoneOffset() *
                              60000,
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    set(
                      "follow_up_at",
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    )
                  }
                />
              </Field>
              <Field label={ar ? "المصدر" : "Source"}>
                <select
                  value={form.source}
                  onChange={(e) => set("source", e.target.value)}
                >
                  {[
                    "website",
                    "whatsapp",
                    "referral",
                    "direct",
                    "social",
                    "other",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label={ar ? "الميزانية" : "Budget"}>
                <input
                  value={form.budget_range || ""}
                  onChange={(e) => set("budget_range", e.target.value)}
                />
              </Field>
            </div>
            <Field label={ar ? "التفاصيل والملاحظات" : "Details & notes"}>
              <textarea
                className="mt-2"
                rows={5}
                value={form.notes || ""}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
            <Feedback error={error} />
            <div className="form-actions">
              {form.id && (
                <a
                  className="px-4 py-2 text-[var(--primary)]"
                  href={"https://wa.me/" + form.phone?.replace(/\D/g, "")}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? "…" : ar ? "حفظ التغييرات" : "Save changes"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
