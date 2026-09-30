import { Link, useParams } from "react-router-dom";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/app/providers/LangContext";
import { offersService, hotelsService } from "@/services";
import { useResource } from "@/lib/request";
import { LoadingState } from "@/components/ui/Operations";
export default function OfferDetail() {
  const { slug } = useParams();
  const { lang } = useLang();
  const ar = lang === "ar";
  const r = useResource(async () => {
    const offer = await offersService.getBySlug(slug || "");
    return {
      offer,
      hotels: offer ? await hotelsService.list() : [],
      related: offer
        ? (await offersService.list({ status: "published" }))
            .filter(
              (o) =>
                o.id !== offer.id &&
                o.destination.country_code === offer.destination.country_code,
            )
            .slice(0, 3)
        : [],
    };
  }, [slug]);
  const o = r.data?.offer;
  return (
    <PublicLayout>
      <LoadingState {...r} retry={r.reload} />
      {!r.loading &&
        !r.error &&
        (!o ? (
          <div className="empty-state">
            <h1>
              {ar
                ? "هذه الباقة غير متاحة حالياً"
                : "This package is unavailable"}
            </h1>
            <Link to="/offers">{ar ? "استعرض الرحلات" : "Browse trips"}</Link>
          </div>
        ) : (
          <article>
            <Link
              to="/offers"
              className="text-sm text-[var(--primary)] inline-block mb-5"
            >
              {ar ? "← جميع الرحلات" : "← All trips"}
            </Link>
            {o.cover_image_url && (
              <img
                src={o.cover_image_url}
                alt={ar ? o.title_ar : o.title}
                className="w-full h-[360px] object-cover rounded-2xl mb-7"
              />
            )}
            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-7">
              <section>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {ar ? o.destination.city_ar : o.destination.city} ·{" "}
                  {ar ? o.destination.country_ar : o.destination.country}
                </p>
                <h1 className="text-3xl font-bold my-4">
                  {ar ? o.title_ar : o.title}
                </h1>
                <p className="whitespace-pre-wrap text-sm leading-8">
                  {ar ? o.description_ar || o.description : o.description}
                </p>
                <div className="flex flex-wrap gap-3 my-6">
                  {[
                    o.pricing.includes_flights &&
                      (ar ? "يشمل الطيران" : "Flights included"),
                    o.pricing.includes_hotel &&
                      (ar ? "يشمل الإقامة" : "Hotel included"),
                    o.pricing.includes_transfers &&
                      (ar ? "يشمل الانتقالات" : "Transfers included"),
                  ]
                    .filter(Boolean)
                    .map((x) => (
                      <span
                        className="bg-[var(--secondary)] text-[var(--primary)] px-3 py-2 rounded-full text-xs"
                        key={String(x)}
                      >
                        {x}
                      </span>
                    ))}
                </div>
                {o.departure_dates.length > 0 && (
                  <p className="mb-6">
                    {ar ? "تواريخ المغادرة: " : "Departure dates: "}
                    {o.departure_dates.join(" · ")}
                  </p>
                )}
                <h2 className="text-xl font-bold mb-4">
                  {ar ? "خيارات الفنادق" : "Hotel options"}
                </h2>
                <div className="grid gap-4">
                  {r.data?.hotels
                    .filter((h) => o.hotel_ids.includes(h.id))
                    .map((h) => {
                      const option = o.hotel_options?.find(
                        (x) => x.hotel_id === h.id,
                      );
                      return (
                        <div
                          key={h.id}
                          className="panel flex gap-5 items-start"
                        >
                          {h.cover_image_url && (
                            <img
                              src={h.cover_image_url}
                              alt={ar ? h.name_ar || h.name : h.name}
                              className="w-28 h-24 rounded-xl object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <h3 className="font-bold">
                              {ar ? h.name_ar || h.name : h.name}
                            </h3>
                            <p className="text-amber-500 text-xs my-1">
                              {"★".repeat(h.stars)}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {option?.room_type} · {option?.meal_plan}
                            </p>
                            <p className="text-xs mt-2">
                              {(ar ? h.amenities_ar : h.amenities).join(" · ")}
                            </p>
                            {option && (
                              <p className="text-[var(--primary)] font-bold mt-3">
                                {option.price.toLocaleString("en-US")}{" "}
                                {o.pricing.currency}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {!o.hotel_ids.length && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {ar
                        ? "يؤكد فريق الرحلات خيارات الإقامة ضمن عرض السعر الخاص بك."
                        : "Our team will confirm accommodation options in your personalised quote."}
                    </p>
                  )}
                </div>
              </section>
              <aside className="panel h-fit lg:sticky lg:top-5">
                <p className="text-sm text-[var(--muted-foreground)]">
                  {ar ? "السعر يبدأ من" : "Price from"}
                </p>
                <strong className="block text-3xl text-[var(--primary)] my-4">
                  {o.pricing.base_price.toLocaleString("en-US")}{" "}
                  <span className="text-sm">{o.pricing.currency}</span>
                </strong>
                <p>
                  {o.duration_nights} {ar ? "ليالٍ" : "nights"} ·{" "}
                  {o.pricing.per_person
                    ? ar
                      ? "للشخص"
                      : "per person"
                    : ar
                      ? "للباقة"
                      : "per package"}
                </p>
                <Link
                  className="block bg-[var(--primary)] text-white rounded-xl text-center px-4 py-3 mt-5"
                  to={"/plan?offer=" + encodeURIComponent(o.slug)}
                >
                  {ar ? "اطلب عرض هذه الباقة" : "Request this package"}
                </Link>
                <p className="text-xs text-[var(--muted-foreground)] mt-4">
                  {ar
                    ? "الحجز والسعر النهائي بعد تأكيد التوفر مع الفريق."
                    : "Booking and final price are subject to confirmation with our team."}
                </p>
                {o.expires_at && (
                  <p className="text-xs mt-4">
                    {ar ? "صالح حتى: " : "Valid until: "}
                    {o.expires_at.slice(0, 10)}
                  </p>
                )}
              </aside>
            </div>
            {!!r.data?.related.length && (
              <section className="mt-12">
                <h2 className="text-xl font-bold mb-5">
                  {ar
                    ? "رحلات أخرى لهذه الوجهة"
                    : "More trips to this destination"}
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {r.data.related.map((p) => (
                    <Link key={p.id} to={"/offers/" + p.slug} className="panel">
                      <strong>{ar ? p.title_ar : p.title}</strong>
                      <p className="mt-3 text-[var(--primary)]">
                        {p.pricing.base_price.toLocaleString("en-US")}{" "}
                        {p.pricing.currency}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        ))}
    </PublicLayout>
  );
}
