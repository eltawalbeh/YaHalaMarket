import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PageTitle,
  Metrics,
  LoadingState,
  DataTable,
  Feedback,
  Icon,
} from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/shared/StatusPill";
import { useLang } from "@/app/providers/LangContext";
import { useAuth } from "@/app/providers/AuthContext";
import { useResource, errorMessage } from "@/lib/request";
import { offersService } from "@/services";
import { OFFER_STATUSES } from "@/lib/constants";
import { exportCSV } from "@/lib/export";
import type { Offer, OfferStatus } from "@/types";
export default function Offers() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user } = useAuth();
  const [params] = useSearchParams();
  const r = useResource(() => offersService.list());
  const offers = r.data || [];
  const [search, setSearch] = useState(params.get("search") || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  useEffect(() => setSearch(params.get("search") || ""), [params]);
  const manager = user?.role === "super_admin" || user?.role === "manager";
  const rows = offers.filter(
    (o) =>
      (!status || o.status === status) &&
      (
        o.title +
        " " +
        o.title_ar +
        " " +
        o.destination.city +
        " " +
        o.destination.city_ar
      )
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  async function change(o: Offer, status: OfferStatus) {
    if (
      status === "archived" &&
      !window.confirm(
        ar
          ? "أرشفة هذا العرض وإخفاؤه عن الزوار؟"
          : "Archive this offer and hide it from visitors?",
      )
    )
      return;
    setBusy(o.id);
    setError("");
    try {
      await offersService.update(o.id, {
        status,
        ...(status === "published"
          ? { published_at: new Date().toISOString(), reviewed_by: user!.id }
          : {}),
      });
      await r.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <DashboardLayout>
      <PageTitle
        title={ar ? "إدارة العروض" : "Offer management"}
        subtitle={
          ar
            ? "أنشئ برامج السفر، راجع الأسعار، وانشرها على موقع يا هلا."
            : "Create travel packages, review pricing and publish to Ya Hala."
        }
      >
        <Button
          variant="secondary"
          onClick={() =>
            exportCSV(
              "offers.csv",
              rows.map((o) => ({
                id: o.id,
                title: o.title,
                title_ar: o.title_ar,
                status: o.status,
                price: o.pricing.base_price,
                currency: o.pricing.currency,
                expires: o.expires_at,
              })),
            )
          }
        >
          <Icon file="585f9" />
          {ar ? "تصدير القائمة" : "Export"}
        </Button>
        {user?.role !== "accounting" && (
          <Link
            className="bg-[var(--primary)] text-white rounded-xl px-4 py-2"
            to="/dashboard/offers/new"
          >
            {ar ? "+ إضافة عرض" : "+ Add offer"}
          </Link>
        )}
      </PageTitle>
      <Metrics
        items={[
          {
            label: ar ? "إجمالي العروض" : "Total offers",
            value: offers.length,
            icon: "c4c4f",
          },
          {
            label: ar ? "عروض منشورة" : "Published",
            value: offers.filter(
              (o) =>
                o.status === "published" &&
                (!o.expires_at || new Date(o.expires_at) > new Date()),
            ).length,
            icon: "0154b",
          },
          {
            label: ar ? "قيد المراجعة" : "In review",
            value: offers.filter((o) => o.status === "in_review").length,
            icon: "abb6f",
          },
          {
            label: ar ? "تنتهي خلال 30 يوماً" : "Expiring in 30 days",
            value: offers.filter(
              (o) =>
                o.status === "published" &&
                o.expires_at &&
                new Date(o.expires_at).getTime() > Date.now() &&
                new Date(o.expires_at).getTime() < Date.now() + 30 * 86400000,
            ).length,
            icon: "4edf7",
          },
        ]}
      />
      <div className="filters">
        <input
          aria-label="Search offers"
          placeholder={
            ar ? "ابحث بالعنوان أو الوجهة…" : "Search title or destination…"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Offer status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{ar ? "كل الحالات" : "All statuses"}</option>
          {Object.entries(OFFER_STATUSES).map(([v, m]) => (
            <option key={v} value={v}>
              {ar ? m.label_ar : m.label}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={r.reload}>
          {ar ? "تحديث" : "Refresh"}
        </Button>
      </div>
      <Feedback error={error} />
      <LoadingState {...r} retry={r.reload} empty={!rows.length} />
      {!r.loading && !r.error && rows.length > 0 && (
        <DataTable
          rows={rows}
          rowKey={(o) => o.id}
          columns={[
            {
              label: ar ? "اسم العرض" : "Offer",
              render: (o) => <strong>{ar ? o.title_ar : o.title}</strong>,
            },
            {
              label: ar ? "الوجهة" : "Destination",
              render: (o) => (ar ? o.destination.city_ar : o.destination.city),
            },
            {
              label: ar ? "الحالة" : "Status",
              render: (o) => (
                <StatusPill
                  status={
                    o.expires_at &&
                    new Date(o.expires_at) < new Date() &&
                    o.status === "published"
                      ? "expired"
                      : o.status
                  }
                  meta={OFFER_STATUSES}
                />
              ),
            },
            {
              label: ar ? "السعر يبدأ من" : "Price from",
              render: (o) => (
                <span dir="ltr">
                  {o.pricing.base_price.toLocaleString("en-US")}{" "}
                  {o.pricing.currency}
                </span>
              ),
            },
            {
              label: ar ? "الصلاحية" : "Valid until",
              render: (o) => o.expires_at?.slice(0, 10) || "—",
            },
            {
              label: ar ? "إجراء" : "Actions",
              render: (o) => (
                <div className="flex gap-2 flex-wrap">
                  {(manager ||
                    (o.created_by === user?.id &&
                      ["draft", "in_review"].includes(o.status) &&
                      user?.role === "staff")) && (
                    <Link
                      className="text-[var(--primary)]"
                      to={"/dashboard/offers/" + o.id + "/edit"}
                    >
                      {ar ? "تعديل" : "Edit"}
                    </Link>
                  )}
                  {o.status === "published" && (
                    <Link
                      className="text-[var(--primary)]"
                      to={"/offers/" + o.slug}
                      target="_blank"
                    >
                      {ar ? "معاينة" : "Preview"}
                    </Link>
                  )}
                  {manager && o.status !== "archived" && (
                    <button
                      disabled={busy === o.id}
                      onClick={() => change(o, "archived")}
                    >
                      {ar ? "أرشفة" : "Archive"}
                    </button>
                  )}
                  {!manager &&
                    o.status === "draft" &&
                    o.created_by === user?.id &&
                    user?.role === "staff" && (
                      <button
                        disabled={busy === o.id}
                        onClick={() => change(o, "in_review")}
                      >
                        {ar ? "إرسال للمراجعة" : "Submit review"}
                      </button>
                    )}
                </div>
              ),
            },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
