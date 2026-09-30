import { useState } from "react";
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
import { useLang } from "@/app/providers/LangContext";
import { useAuth } from "@/app/providers/AuthContext";
import { hotelsService } from "@/services";
import { uploadImage } from "@/services/media";
import { useResource, errorMessage } from "@/lib/request";
import { exportCSV } from "@/lib/export";
import type { Hotel } from "@/types";
import type { HotelRateCard } from "@/types/rateCard";
const initial: Partial<Hotel> = {
  name: "",
  name_ar: "",
  destination_city: "",
  destination_city_ar: "",
  destination_country: "",
  destination_country_code: "",
  stars: 5,
  address: "",
  address_ar: "",
  check_in_time: "15:00",
  check_out_time: "12:00",
  amenities: [],
  amenities_ar: [],
  cover_image_url: null,
  is_active: true,
};
export default function Hotels() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user } = useAuth();
  const canManage = user?.role === "manager" || user?.role === "super_admin";
  const r = useResource(async () => ({
    hotels: await hotelsService.list(),
    rates: await hotelsService.rates(),
  }));
  const hotels = r.data?.hotels || [];
  const rates = r.data?.rates || [];
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [form, setForm] = useState<Partial<Hotel> | null>(null);
  const [rate, setRate] = useState<Partial<HotelRateCard> | null>(null);
  const [selected, setSelected] = useState<Hotel | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rows = hotels.filter(
    (h) =>
      (
        h.name +
        " " +
        h.name_ar +
        " " +
        h.destination_city +
        " " +
        h.destination_city_ar
      )
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!active || String(h.is_active) === active),
  );
  const expiring = rates
    .filter(
      (r) =>
        r.status === "active" &&
        r.valid_until >= new Date().toISOString().slice(0, 10) &&
        new Date(r.valid_until).getTime() < Date.now() + 45 * 86400000,
    )
    .sort((a, b) => a.valid_until.localeCompare(b.valid_until));
  const set = (key: keyof Hotel, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError("");
    try {
      if (form.id) await hotelsService.update(form.id, form);
      else
        await hotelsService.create({
          ...initial,
          ...form,
        } as Omit<Hotel, "id" | "created_at" | "updated_at">);
      setForm(null);
      await r.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function saveRate(e: React.FormEvent) {
    e.preventDefault();
    if (!rate) return;
    setBusy(true);
    setError("");
    try {
      await hotelsService.saveRate(rate);
      setRate(null);
      await r.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function image(file?: File) {
    if (!file || !user) return;
    setBusy(true);
    setError("");
    try {
      set("cover_image_url", await uploadImage(file, user.id));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const field = (
    key: keyof Hotel,
    label: string,
    type = "text",
    required = false,
  ) => (
    <Field label={label}>
      <input
        required={required}
        type={type}
        value={String(form?.[key] ?? "")}
        onChange={(e) => set(key, e.target.value)}
      />
    </Field>
  );
  function newRate(h: Hotel) {
    setSelected(null);
    setError("");
    setRate({
      hotel_id: h.id,
      supplier_name: "",
      room_type: "",
      meal_plan: "",
      valid_from: new Date().toISOString().slice(0, 10),
      valid_until: "",
      currency: "SAR",
      cost_price: 0,
      selling_price: 0,
      occupancy: 2,
      status: "draft",
      document_ids: [],
      created_by: user!.id,
      approved_by: null,
    });
  }
  return (
    <DashboardLayout>
      <PageTitle
        title={ar ? "إدارة الفنادق" : "Hotels"}
        subtitle={
          ar
            ? "دليل الشركاء، بطاقات الأسعار، وصلاحية التعاقدات."
            : "Partners, rate cards and contract validity."
        }
      >
        <Button
          variant="secondary"
          onClick={() =>
            exportCSV(
              "hotels.csv",
              rows.map((h) => ({
                name: h.name,
                name_ar: h.name_ar,
                city: h.destination_city,
                country: h.destination_country,
                stars: h.stars,
                active: h.is_active,
              })),
            )
          }
        >
          {ar ? "تصدير CSV" : "Export CSV"}
        </Button>
        {canManage && (
          <Button
            onClick={() => {
              setForm(initial);
              setError("");
            }}
          >
            {ar ? "+ إضافة فندق" : "+ Add hotel"}
          </Button>
        )}
      </PageTitle>
      <Metrics
        items={[
          {
            label: ar ? "شركاء الفنادق" : "Hotel partners",
            value: hotels.length,
            icon: "68562",
          },
          {
            label: ar ? "فنادق نشطة" : "Active hotels",
            value: hotels.filter((h) => h.is_active).length,
            icon: "6ba6a",
          },
          {
            label: ar ? "بطاقات تنتهي قريباً" : "Rates expiring soon",
            value: expiring.length,
            icon: "097fa",
          },
          {
            label: ar ? "متوسط التصنيف" : "Average stars",
            value: hotels.length
              ? (
                  hotels.reduce((s, h) => s + h.stars, 0) / hotels.length
                ).toFixed(1)
              : "—",
            icon: "19ec3",
          },
        ]}
      />
      <div className="filters">
        <input
          aria-label="Search hotels"
          placeholder={ar ? "اسم الفندق أو المدينة…" : "Hotel or city…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Hotel availability"
          value={active}
          onChange={(e) => setActive(e.target.value)}
        >
          <option value="">{ar ? "كل الفنادق" : "All hotels"}</option>
          <option value="true">{ar ? "نشط" : "Active"}</option>
          <option value="false">{ar ? "غير نشط" : "Inactive"}</option>
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
            rowKey={(h) => h.id}
            columns={[
              {
                label: ar ? "الفندق" : "Hotel",
                render: (h) => (
                  <strong>{ar ? h.name_ar || h.name : h.name}</strong>
                ),
              },
              {
                label: ar ? "المدينة" : "City",
                render: (h) =>
                  ar
                    ? h.destination_city_ar || h.destination_city
                    : h.destination_city,
              },
              {
                label: ar ? "التصنيف" : "Stars",
                render: (h) => (
                  <span className="text-amber-500">{"★".repeat(h.stars)}</span>
                ),
              },
              {
                label: ar ? "الحالة" : "Status",
                render: (h) =>
                  h.is_active
                    ? ar
                      ? "نشط"
                      : "Active"
                    : ar
                      ? "غير نشط"
                      : "Inactive",
              },
              {
                label: ar ? "إجراء" : "Actions",
                render: (h) => (
                  <div className="flex gap-3">
                    <button
                      className="text-[var(--primary)]"
                      onClick={() => setSelected(h)}
                    >
                      {ar ? "الأسعار" : "Rates"}
                    </button>
                    {canManage && (
                      <button
                        onClick={() => {
                          setForm(h);
                          setError("");
                        }}
                      >
                        {ar ? "تعديل" : "Edit"}
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
          <aside className="panel">
            <h2>{ar ? "تجديدات قريبة" : "Upcoming renewals"}</h2>
            {expiring.slice(0, 5).map((rate) => (
              <div
                key={rate.id}
                className="rounded-xl bg-[var(--muted)] p-3 mb-3"
              >
                <strong>
                  {hotels.find((h) => h.id === rate.hotel_id)?.name}
                </strong>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {rate.room_type} · {rate.valid_until}
                </p>
              </div>
            ))}
            {!expiring.length && (
              <p className="text-xs text-[var(--muted-foreground)]">
                {ar
                  ? "لا توجد بطاقات تنتهي خلال 45 يوماً."
                  : "No rate cards expire within 45 days."}
              </p>
            )}
          </aside>
        </div>
      )}
      {form && (
        <Modal
          title={ar ? "بيانات الفندق" : "Hotel details"}
          onClose={() => !busy && setForm(null)}
        >
          <form onSubmit={save}>
            <div className="form-grid">
              {field("name", "Hotel name", "text", true)}
              {field("name_ar", "اسم الفندق بالعربية")}
              {field("destination_city", "City", "text", true)}
              {field("destination_city_ar", "المدينة بالعربية")}
              {field("destination_country", "Country", "text", true)}
              {field(
                "destination_country_code",
                "Country code (TR, AE…)",
                "text",
                true,
              )}
              <Field label={ar ? "عدد النجوم" : "Star rating"}>
                <select
                  value={form.stars}
                  onChange={(e) => set("stars", Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label={ar ? "الحالة" : "Status"}>
                <select
                  value={String(form.is_active)}
                  onChange={(e) => set("is_active", e.target.value === "true")}
                >
                  <option value="true">{ar ? "نشط" : "Active"}</option>
                  <option value="false">{ar ? "غير نشط" : "Inactive"}</option>
                </select>
              </Field>
              {field("address", "Address")}
              {field("address_ar", "العنوان بالعربية")}
              {field("check_in_time", ar ? "تسجيل الدخول" : "Check-in", "time")}
              {field(
                "check_out_time",
                ar ? "تسجيل الخروج" : "Check-out",
                "time",
              )}
              {field(
                "cover_image_url",
                ar ? "رابط الصورة" : "Image URL",
                "url",
              )}
              <Field label={ar ? "رفع صورة" : "Upload image"}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  disabled={busy}
                  onChange={(e) => image(e.target.files?.[0])}
                />
              </Field>
              <Field label="Amenities (comma separated)">
                <input
                  value={form.amenities?.join(", ")}
                  onChange={(e) =>
                    set(
                      "amenities",
                      e.target.value.split(",").map((s) => s.trim()),
                    )
                  }
                />
              </Field>
              <Field label="المرافق (مفصولة بفاصلة)">
                <input
                  value={form.amenities_ar?.join("، ")}
                  onChange={(e) =>
                    set(
                      "amenities_ar",
                      e.target.value.split(/[,،]/).map((s) => s.trim()),
                    )
                  }
                />
              </Field>
            </div>
            {form.cover_image_url && (
              <img
                className="h-40 w-full object-cover rounded-xl mt-4"
                src={form.cover_image_url}
                alt=""
              />
            )}
            <Feedback error={error} />
            <div className="form-actions">
              <Button type="submit" disabled={busy}>
                {busy ? "…" : ar ? "حفظ الفندق" : "Save hotel"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {selected && (
        <Modal
          title={ar ? selected.name_ar || selected.name : selected.name}
          onClose={() => setSelected(null)}
        >
          <div className="grid gap-3">
            {rates
              .filter((r) => r.hotel_id === selected.id)
              .map((rate) => (
                <div
                  key={rate.id}
                  className="rounded-xl border border-[var(--border)] p-4"
                >
                  <strong>
                    {rate.room_type} · {rate.meal_plan}
                  </strong>
                  <p className="text-xs my-2">
                    {rate.valid_from} → {rate.valid_until} · {rate.status}
                  </p>
                  <p>
                    {ar ? "التكلفة: " : "Cost: "}
                    {rate.cost_price} {rate.currency} ·{" "}
                    {ar ? "البيع: " : "Sell: "}
                    {rate.selling_price} {rate.currency}
                  </p>
                  {canManage && (
                    <Button
                      className="mt-3"
                      variant="secondary"
                      onClick={() => {
                        setSelected(null);
                        setRate(rate);
                        setError("");
                      }}
                    >
                      {ar ? "تعديل" : "Edit"}
                    </Button>
                  )}
                </div>
              ))}
          </div>
          {canManage && (
            <Button className="mt-5" onClick={() => newRate(selected)}>
              {ar ? "+ إضافة بطاقة سعر" : "+ Add rate card"}
            </Button>
          )}
          {!rates.some((r) => r.hotel_id === selected.id) && (
            <p className="my-4 text-sm">
              {ar
                ? "لا توجد بطاقات أسعار لهذا الفندق."
                : "No rate cards for this hotel."}
            </p>
          )}
        </Modal>
      )}
      {rate && (
        <Modal
          title={ar ? "بطاقة السعر" : "Rate card"}
          onClose={() => !busy && setRate(null)}
        >
          <form onSubmit={saveRate}>
            <div className="form-grid">
              {(
                [
                  "supplier_name",
                  "room_type",
                  "meal_plan",
                  "valid_from",
                  "valid_until",
                  "cost_price",
                  "selling_price",
                  "occupancy",
                ] as const
              ).map((key, i) => (
                <Field
                  key={key}
                  label={
                    (ar
                      ? [
                          "اسم المورد",
                          "نوع الغرفة",
                          "الوجبات",
                          "من تاريخ",
                          "إلى تاريخ",
                          "سعر التكلفة",
                          "سعر البيع",
                          "الإشغال",
                        ]
                      : [
                          "Supplier",
                          "Room type",
                          "Meal plan",
                          "Valid from",
                          "Valid until",
                          "Cost price",
                          "Selling price",
                          "Occupancy",
                        ])[i]
                  }
                >
                  <input
                    required={key !== "meal_plan"}
                    type={i >= 5 ? "number" : i >= 3 ? "date" : "text"}
                    min={
                      i >= 5
                        ? key === "occupancy"
                          ? 1
                          : 0
                        : key === "valid_until"
                          ? rate.valid_from
                          : undefined
                    }
                    step={i >= 5 ? "0.01" : undefined}
                    value={String(rate[key] ?? "")}
                    onChange={(e) =>
                      setRate((v) => ({
                        ...v,
                        [key]: i >= 5 ? Number(e.target.value) : e.target.value,
                      }))
                    }
                  />
                </Field>
              ))}
              <Field label={ar ? "العملة" : "Currency"}>
                <select
                  value={rate.currency}
                  onChange={(e) =>
                    setRate((v) => ({ ...v, currency: e.target.value }))
                  }
                >
                  {["SAR", "USD", "EUR", "AED", "JOD"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label={ar ? "الحالة" : "Status"}>
                <select
                  value={rate.status}
                  onChange={(e) =>
                    setRate((v) => ({
                      ...v,
                      status: e.target.value as HotelRateCard["status"],
                      approved_by:
                        e.target.value === "active" ? user!.id : null,
                    }))
                  }
                >
                  {["draft", "active", "expired", "archived"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Feedback error={error} />
            <div className="form-actions">
              <Button type="submit" disabled={busy}>
                {busy ? "…" : ar ? "حفظ بطاقة السعر" : "Save rate card"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
