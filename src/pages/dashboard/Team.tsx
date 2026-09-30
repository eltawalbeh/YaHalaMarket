import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PageTitle,
  Metrics,
  LoadingState,
  Field,
  Modal,
  Feedback,
  DataTable,
} from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/app/providers/LangContext";
import { useAuth } from "@/app/providers/AuthContext";
import { usersService, leadsService, quotesService } from "@/services";
import { useResource, errorMessage } from "@/lib/request";
import { USER_ROLES } from "@/lib/constants";
import type { User, UserRole } from "@/types";
export default function Team() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user, refreshProfile } = useAuth();
  const r = useResource(async () => ({
    users: await usersService.list(),
    leads: await leadsService.list(),
    quotes: await quotesService.list(),
  }));
  const [form, setForm] = useState<
    | (Partial<User> & {
        password?: string;
      })
    | null
  >(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const users = r.data?.users || [];
  const activeLeads = (id: string) =>
    r.data?.leads.filter(
      (l) => l.assigned_to === id && !["sold", "lost"].includes(l.status),
    ).length || 0;
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError("");
    try {
      if (form.id)
        await usersService.update(form.id, {
          full_name: form.full_name,
          full_name_ar: form.full_name_ar,
          role: form.role,
          is_active: form.is_active,
        });
      else
        await usersService.create({
          email: form.email!,
          password: form.password!,
          full_name: form.full_name!,
          full_name_ar: form.full_name_ar || "",
          role: form.role!,
        });
      if (form.id === user?.id) await refreshProfile();
      setForm(null);
      await r.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <DashboardLayout>
      <PageTitle
        title={ar ? "إدارة الفريق" : "Team management"}
        subtitle={
          ar
            ? "أعضاء الفريق، توزيع العملاء، والأدوار والصلاحيات."
            : "Employees, lead distribution and role permissions."
        }
      >
        <Button
          onClick={() => {
            setForm({
              email: "",
              full_name: "",
              full_name_ar: "",
              password: "",
              role: "staff",
              is_active: true,
            });
            setError("");
          }}
        >
          {ar ? "+ إضافة موظف" : "+ Add employee"}
        </Button>
      </PageTitle>
      <Metrics
        items={[
          {
            label: ar ? "أعضاء الفريق" : "Team members",
            value: users.length,
            icon: "ea6d9",
          },
          {
            label: ar ? "حسابات مفعّلة" : "Active accounts",
            value: users.filter((u) => u.is_active).length,
            icon: "09a33",
          },
          {
            label: ar ? "عملاء غير معيّنين" : "Unassigned leads",
            value:
              r.data?.leads.filter(
                (l) => !l.assigned_to && !["sold", "lost"].includes(l.status),
              ).length || 0,
            icon: "dd900",
          },
          { label: ar ? "الأدوار" : "Roles", value: 4, icon: "9d9f7" },
        ]}
      />
      <LoadingState {...r} retry={r.reload} />
      {r.data && (
        <div className="grid xl:grid-cols-2 gap-5">
          <section className="panel">
            <h2>{ar ? "أعضاء الفريق" : "Team members"}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {users.map((u) => (
                <button
                  key={u.id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-5 text-start hover:bg-[var(--muted)]"
                  onClick={() => {
                    setForm(u);
                    setError("");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[var(--secondary)] text-[var(--primary)] w-10 h-10 flex items-center justify-center font-bold">
                      {(ar ? u.full_name_ar || u.full_name : u.full_name).slice(
                        0,
                        2,
                      )}
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate">
                        {ar
                          ? u.full_name_ar || u.full_name
                          : u.full_name || u.email}
                      </strong>
                      <small className="text-[var(--muted-foreground)]">
                        {ar
                          ? USER_ROLES[u.role].label_ar
                          : USER_ROLES[u.role].label}
                      </small>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] break-all my-3">
                    {u.email}
                  </p>
                  <div className="flex justify-between text-xs">
                    <span>
                      {activeLeads(u.id)} {ar ? "عملاء نشطون" : "active leads"}
                    </span>
                    <span
                      className={
                        u.is_active ? "text-green-700" : "text-red-600"
                      }
                    >
                      {u.is_active
                        ? ar
                          ? "مفعّل"
                          : "Active"
                        : ar
                          ? "معطّل"
                          : "Inactive"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2>{ar ? "توزيع العمل" : "Workload distribution"}</h2>
            <DataTable
              rows={users}
              rowKey={(u) => u.id}
              columns={[
                {
                  label: ar ? "الموظف" : "Employee",
                  render: (u) =>
                    ar ? u.full_name_ar || u.full_name : u.full_name,
                },
                {
                  label: ar ? "عملاء نشطون" : "Active leads",
                  render: (u) => activeLeads(u.id),
                },
                {
                  label: ar ? "عروض مقبولة" : "Accepted quotes",
                  render: (u) =>
                    r.data!.quotes.filter(
                      (q) => q.assigned_to === u.id && q.status === "accepted",
                    ).length,
                },
              ]}
            />
            <p className="mt-5 text-xs text-[var(--muted-foreground)]">
              {ar
                ? "Superadmin يدير الفريق والصلاحيات. Manager يدير المحتوى والنشر. Staff يتابع العملاء وعروضه. Accounting للاطلاع والتصدير فقط."
                : "Superadmin manages accounts. Manager manages publishing and content. Staff handles leads and assigned quotations. Accounting can read and export."}
            </p>
          </section>
        </div>
      )}
      {form && (
        <Modal
          title={
            form.id
              ? ar
                ? "تعديل الموظف"
                : "Edit employee"
              : ar
                ? "إضافة موظف"
                : "Add employee"
          }
          onClose={() => !busy && setForm(null)}
        >
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Full name">
                <input
                  required
                  minLength={2}
                  maxLength={160}
                  value={form.full_name || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                />
              </Field>
              <Field label="الاسم بالعربية">
                <input
                  value={form.full_name_ar || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name_ar: e.target.value }))
                  }
                />
              </Field>
              <Field label={ar ? "البريد الإلكتروني" : "Email"}>
                <input
                  disabled={!!form.id}
                  required
                  type="email"
                  value={form.email || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </Field>
              <Field label={ar ? "الدور" : "Role"}>
                <select
                  disabled={form.id === user?.id}
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value as UserRole }))
                  }
                >
                  {Object.entries(USER_ROLES).map(([v, m]) => (
                    <option key={v} value={v}>
                      {m.label} · {m.label_ar}
                    </option>
                  ))}
                </select>
              </Field>
              {!form.id ? (
                <Field
                  label={
                    ar
                      ? "كلمة مرور أولية (12 حرفاً على الأقل)"
                      : "Initial password (12+ characters)"
                  }
                >
                  <input
                    required
                    autoComplete="new-password"
                    type="password"
                    minLength={12}
                    maxLength={128}
                    value={form.password || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                </Field>
              ) : (
                <label className="flex items-center gap-3">
                  <input
                    disabled={form.id === user?.id}
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                  />
                  {ar ? "حساب مفعّل" : "Active account"}
                </label>
              )}
            </div>
            {!form.id && (
              <p className="text-xs text-[var(--muted-foreground)] mt-4">
                {ar
                  ? "لن يُرسل بريد تلقائي. شارك بيانات الدخول مع الموظف بشكل خاص، ويمكنه تغيير كلمة المرور من إعدادات حسابه."
                  : "No automatic email is sent. Share credentials privately; the employee can change their password in Settings."}
              </p>
            )}
            <Feedback error={error} />
            <div className="form-actions">
              <Button type="submit" disabled={busy}>
                {busy ? "…" : ar ? "حفظ الموظف" : "Save employee"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
