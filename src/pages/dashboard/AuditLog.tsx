import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageTitle, LoadingState, DataTable } from "@/components/ui/Operations";
import { useLang } from "@/app/providers/LangContext";
import { db, request, useResource } from "@/lib/request";
export default function AuditLog() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const r = useResource(
    async () =>
      (await request(
        db()
          .from("audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
      )) as {
        id: string;
        user_id: string;
        action: string;
        resource: string;
        resource_id: string;
        created_at: string;
        diff: { fields?: string[] };
      }[],
  );
  return (
    <DashboardLayout>
      <PageTitle
        title={ar ? "سجل النشاطات" : "Audit log"}
        subtitle={
          ar
            ? "آخر 500 عملية مسجلة من قاعدة البيانات."
            : "Latest 500 operations recorded by the database."
        }
      />
      <LoadingState {...r} retry={r.reload} empty={!r.data?.length} />
      {r.data && (
        <DataTable
          rows={r.data}
          rowKey={(x) => x.id}
          columns={[
            {
              label: ar ? "الوقت" : "Time",
              render: (x) => new Date(x.created_at).toLocaleString("en-GB"),
            },
            { label: ar ? "العملية" : "Action", render: (x) => x.action },
            { label: ar ? "القسم" : "Resource", render: (x) => x.resource },
            {
              label: ar ? "المرجع" : "Reference",
              render: (x) => x.resource_id.slice(0, 8),
            },
            {
              label: ar ? "الحقول المعدلة" : "Changed fields",
              render: (x) => x.diff?.fields?.join(", ") || "—",
            },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
