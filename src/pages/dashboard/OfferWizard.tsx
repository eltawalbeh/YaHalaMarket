import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Field,
  Feedback,
  PageTitle,
  LoadingState,
} from "@/components/ui/Operations";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/app/providers/LangContext";
import { useAuth } from "@/app/providers/AuthContext";
import { offersService, hotelsService } from "@/services";
import { uploadImage } from "@/services/media";
import { useResource, errorMessage, db, request } from "@/lib/request";
import type { Offer, OfferStatus } from "@/types";
type Form = {
  title: string;
  title_ar: string;
  city: string;
  city_ar: string;
  country: string;
  country_ar: string;
  country_code: string;
  duration_nights: number;
  expires_at: string;
  price: number;
  currency: string;
  description: string;
  description_ar: string;
  cover_image_url: string;
  departure_dates: string;
  tags: string;
  tags_ar: string;
  per_person: boolean;
  includes_flights: boolean;
  includes_hotel: boolean;
  includes_transfers: boolean;
  hotel_options: NonNullable<Offer["hotel_options"]>;
};
const initial: Form = {
  title: "",
  title_ar: "",
  city: "",
  city_ar: "",
  country: "",
  country_ar: "",
  country_code: "",
  duration_nights: 3,
  expires_at: "",
  price: 0,
  currency: "SAR",
  description: "",
  description_ar: "",
  cover_image_url: "",
  departure_dates: "",
  tags: "",
  tags_ar: "",
  per_person: true,
  includes_flights: false,
  includes_hotel: true,
  includes_transfers: false,
  hotel_options: [],
};
export default function OfferWizard() {
  const { id } = useParams();
  const nav = useNavigate();
  const { lang } = useLang();
  const ar = lang === "ar";
  const { user } = useAuth();
  const manager = user?.role === "manager" || user?.role === "super_admin";
  const [form, setForm] = useState<Form>(initial);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saveId] = useState(() => id || crypto.randomUUID());
  const r = useResource(
    async () => ({
      offer: id ? await offersService.getById(id) : null,
      hotels: await hotelsService.list(),
    }),
    [id],
  );
  useEffect(() => {
    const o = r.data?.offer;
    if (o)
      setForm({
        title: o.title,
        title_ar: o.title_ar,
        city: o.destination.city,
        city_ar: o.destination.city_ar,
        country: o.destination.country,
        country_ar: o.destination.country_ar,
        country_code: o.destination.country_code,
        duration_nights: o.duration_nights,
        expires_at: o.expires_at?.slice(0, 10) || "",
        price: o.pricing.base_price,
        currency: o.pricing.currency,
        description: o.description,
        description_ar: o.description_ar,
        cover_image_url: o.cover_image_url || "",
        departure_dates: o.departure_dates.join(", "),
        tags: o.tags.join(", "),
        tags_ar: o.tags_ar.join("، "),
        per_person: o.pricing.per_person,
        includes_flights: o.pricing.includes_flights,
        includes_hotel: o.pricing.includes_hotel,
        includes_transfers: o.pricing.includes_transfers,
        hotel_options: o.hotel_options?.length
          ? o.hotel_options
          : o.hotel_ids.map((hotel_id) => ({
              hotel_id,
              price: o.pricing.base_price,
              room_type: "",
              meal_plan: "",
            })),
      });
  }, [r.data]);
  const set = (key: keyof Form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));
  const field = (key: keyof Form, label: string, type = "text") => (
    <Field label={label}>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={String(form[key])}
        onChange={(e) =>
          set(key, type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
    </Field>
  );
  const canEdit =
    manager ||
    ((!id ||
      (r.data?.offer?.created_by === user?.id &&
        ["draft", "in_review"].includes(r.data?.offer?.status || ""))) &&
      user?.role === "staff");
  async function save(status: OfferStatus) {
    setError("");
    if (!canEdit || !user) return;
    if (
      !form.title.trim() ||
      !form.title_ar.trim() ||
      !form.city.trim() ||
      !form.country.trim() ||
      form.price <= 0 ||
      form.duration_nights < 1
    ) {
      setError(
        ar
          ? "أكمل العناوين والوجهة وعدد الليالي والسعر الصحيح."
          : "Complete titles, destination, nights and a positive price.",
      );
      return;
    }
    if (
      status === "published" &&
      (!form.cover_image_url ||
        !form.expires_at ||
        new Date(form.expires_at + "T23:59:59Z") < new Date())
    ) {
      setError(
        ar
          ? "النشر يحتاج صورة غلاف وتاريخ انتهاء مستقبلي."
          : "Publishing needs a cover image and a future expiry date.",
      );
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        title_ar: form.title_ar.trim(),
        description: form.description,
        description_ar: form.description_ar,
        status,
        destination: {
          city: form.city,
          city_ar: form.city_ar || form.city,
          country: form.country,
          country_ar: form.country_ar || form.country,
          country_code: form.country_code.toUpperCase(),
        },
        pricing: {
          base_price: form.price,
          currency: form.currency,
          per_person: form.per_person,
          includes_flights: form.includes_flights,
          includes_hotel: form.includes_hotel,
          includes_transfers: form.includes_transfers,
        },
        duration_nights: form.duration_nights,
        expires_at: form.expires_at ? form.expires_at + "T23:59:59Z" : null,
        departure_dates: form.departure_dates
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        hotel_ids: form.hotel_options.map((h) => h.hotel_id),
        hotel_options: form.hotel_options,
        cover_image_url: form.cover_image_url || null,
        tags: form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tags_ar: form.tags_ar
          .split(/[,،]/)
          .map((s) => s.trim())
          .filter(Boolean),
        ...(status === "published"
          ? {
              published_at:
                r.data?.offer?.published_at || new Date().toISOString(),
              reviewed_by: user.id,
            }
          : {}),
      };
      if (id) await offersService.update(id, payload);
      else {
        const { error: insertError } = await db()
          .from("offers")
          .insert({
            ...payload,
            id: saveId,
            slug:
              (form.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "") || "offer") +
              "-" +
              saveId.slice(0, 8),
            created_by: user.id,
          });
        if (insertError) {
          if (
            insertError.code === "23505" &&
            (await offersService.getById(saveId))
          )
            await offersService.update(saveId, payload);
          else throw insertError;
        }
      }
      nav("/dashboard/offers");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function image(file?: File) {
    if (!file || !user) return;
    setUploading(true);
    setError("");
    try {
      set("cover_image_url", await uploadImage(file, user.id));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setUploading(false);
    }
  }
  const steps = ar
    ? ["الأساسيات", "الفنادق والتسعير", "البرنامج والصور", "المراجعة والنشر"]
    : ["Basics", "Hotels & pricing", "Itinerary & images", "Review & publish"];
  if (r.loading || r.error)
    return (
      <DashboardLayout>
        <LoadingState {...r} retry={r.reload} />
      </DashboardLayout>
    );
  if ((id && !r.data?.offer) || !canEdit)
    return (
      <DashboardLayout>
        <Feedback
          error={
            ar
              ? "العرض غير موجود أو لا تملك صلاحية تعديله."
              : "Offer not found or editing is not allowed."
          }
        />
      </DashboardLayout>
    );
  return (
    <DashboardLayout>
      <PageTitle
        title={
          id
            ? ar
              ? "تعديل العرض"
              : "Edit offer"
            : ar
              ? "إضافة عرض جديد"
              : "New offer"
        }
        subtitle={
          ar
            ? "تفاصيل الباقة، خيارات الفنادق والأسعار التي تظهر للعميل."
            : "Package details, hotel options and customer-facing prices."
        }
      />
      <div className="flex flex-wrap gap-3 mb-6">
        {steps.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={
              "rounded-xl px-4 py-3 " +
              (step === i
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--border)]")
            }
          >
            {i + 1} · {label}
          </button>
        ))}
      </div>
      <Feedback error={error} />
      <div className="panel">
        {step === 0 && (
          <div className="form-grid">
            {field("title", "Title (English)")}
            {field("title_ar", "العنوان بالعربية")}
            {field("city", "City")}
            {field("city_ar", "المدينة")}
            {field("country", "Country")}
            {field("country_ar", "الدولة")}
            {field(
              "country_code",
              ar ? "رمز الدولة مثل TR" : "Country code, e.g. TR",
            )}
            {field("duration_nights", ar ? "عدد الليالي" : "Nights", "number")}
            {field("expires_at", ar ? "صالح حتى" : "Valid until", "date")}
            {field(
              "departure_dates",
              ar
                ? "تواريخ المغادرة، مفصولة بفاصلة"
                : "Departure dates, comma separated",
            )}
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-5">
            <div className="form-grid">
              {field("price", ar ? "السعر يبدأ من" : "Price from", "number")}
              <Field label={ar ? "العملة" : "Currency"}>
                <select
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                >
                  {["SAR", "USD", "EUR", "AED", "JOD"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-5">
              {(
                [
                  "per_person",
                  "includes_flights",
                  "includes_hotel",
                  "includes_transfers",
                ] as const
              ).map((key, i) => (
                <label className="flex gap-2 items-center" key={key}>
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  {
                    (ar
                      ? [
                          "السعر للشخص",
                          "يشمل الطيران",
                          "يشمل الإقامة",
                          "يشمل الانتقالات",
                        ]
                      : [
                          "Per person",
                          "Flights included",
                          "Hotel included",
                          "Transfers included",
                        ])[i]
                  }
                </label>
              ))}
            </div>
            <h2>{ar ? "خيارات الفندق للعميل" : "Customer hotel options"}</h2>
            {r.data?.hotels
              .filter((h) => h.is_active)
              .map((h) => {
                const option = form.hotel_options.find(
                  (o) => o.hotel_id === h.id,
                );
                return (
                  <div
                    key={h.id}
                    className="border border-[var(--border)] rounded-xl p-4"
                  >
                    <label className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        checked={!!option}
                        onChange={(e) =>
                          set(
                            "hotel_options",
                            e.target.checked
                              ? [
                                  ...form.hotel_options,
                                  {
                                    hotel_id: h.id,
                                    price: form.price,
                                    room_type: "",
                                    meal_plan: "",
                                  },
                                ]
                              : form.hotel_options.filter(
                                  (o) => o.hotel_id !== h.id,
                                ),
                          )
                        }
                      />
                      {ar ? h.name_ar || h.name : h.name} ·{" "}
                      {"★".repeat(h.stars)}
                    </label>
                    {option && (
                      <div className="grid sm:grid-cols-3 gap-3 mt-4">
                        {(["price", "room_type", "meal_plan"] as const).map(
                          (key, i) => (
                            <Field
                              key={key}
                              label={
                                (ar
                                  ? [
                                      "سعر الباقة مع الفندق",
                                      "نوع الغرفة",
                                      "الوجبات",
                                    ]
                                  : [
                                      "Package price",
                                      "Room type",
                                      "Meal plan",
                                    ])[i]
                              }
                            >
                              <input
                                type={key === "price" ? "number" : "text"}
                                min={0}
                                value={option[key]}
                                onChange={(e) =>
                                  set(
                                    "hotel_options",
                                    form.hotel_options.map((o) =>
                                      o.hotel_id === h.id
                                        ? {
                                            ...o,
                                            [key]:
                                              key === "price"
                                                ? Number(e.target.value)
                                                : e.target.value,
                                          }
                                        : o,
                                    ),
                                  )
                                }
                              />
                            </Field>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            {!r.data?.hotels.length && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {ar
                  ? "أضف الفنادق من صفحة الفنادق أولاً."
                  : "Add hotels from the Hotels page first."}
              </p>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-5">
            <div className="form-grid">
              <Field label="Description & itinerary">
                <textarea
                  rows={8}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field label="الوصف وبرنامج الرحلة">
                <textarea
                  rows={8}
                  value={form.description_ar}
                  onChange={(e) => set("description_ar", e.target.value)}
                />
              </Field>
              {field("tags", "Categories (comma separated)")}
              {field("tags_ar", "التصنيفات (مفصولة بفاصلة)")}
              {field(
                "cover_image_url",
                ar ? "رابط صورة الغلاف" : "Cover image URL",
                "url",
              )}
              <Field
                label={
                  ar ? "رفع صورة (5 MB كحد أقصى)" : "Upload image (max 5 MB)"
                }
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  disabled={uploading}
                  onChange={(e) => image(e.target.files?.[0])}
                />
              </Field>
            </div>
            {uploading && <p>{ar ? "جارٍ رفع الصورة…" : "Uploading…"}</p>}
            {form.cover_image_url && (
              <img
                src={form.cover_image_url}
                alt=""
                className="h-48 w-full object-cover rounded-xl"
              />
            )}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            {form.cover_image_url && (
              <img
                src={form.cover_image_url}
                alt=""
                className="h-52 w-full object-cover rounded-xl"
              />
            )}
            <h2>{ar ? form.title_ar : form.title}</h2>
            <p>
              {ar ? form.city_ar : form.city} · {form.duration_nights}{" "}
              {ar ? "ليالٍ" : "nights"}
            </p>
            <p className="text-2xl text-[var(--primary)]">
              {form.price.toLocaleString("en-US")} {form.currency}
            </p>
            <p className="whitespace-pre-wrap">
              {ar ? form.description_ar : form.description}
            </p>
            <p>
              {ar ? "خيارات الفنادق: " : "Hotel options: "}
              {form.hotel_options.length}
            </p>
            <p>
              {ar ? "صالح حتى: " : "Valid until: "}
              {form.expires_at || "—"}
            </p>
          </div>
        )}
      </div>
      <div className="form-actions">
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => (step ? setStep(step - 1) : nav("/dashboard/offers"))}
        >
          {ar ? "السابق" : "Back"}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>
            {ar ? "التالي" : "Next"}
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              disabled={busy || uploading}
              onClick={() => save("draft")}
            >
              {busy ? "…" : ar ? "حفظ المسودة" : "Save draft"}
            </Button>
            <Button
              disabled={busy || uploading}
              onClick={() => save(manager ? "published" : "in_review")}
            >
              {busy
                ? ar
                  ? "جارٍ الحفظ…"
                  : "Saving…"
                : manager
                  ? ar
                    ? "حفظ ونشر"
                    : "Save & publish"
                  : ar
                    ? "إرسال للمراجعة"
                    : "Submit for review"}
            </Button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
