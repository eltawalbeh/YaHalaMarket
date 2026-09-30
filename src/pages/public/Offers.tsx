import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/public/PublicLayout";
import { useLang } from "@/app/providers/LangContext";
import { useSite } from "@/app/providers/SiteContext";
import { useResource } from "@/lib/request";
import { offersService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Icon, LoadingState } from "@/components/ui/Operations";
export default function Offers() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { site } = useSite();
  const [params, setParams] = useSearchParams();
  const r = useResource(() => offersService.list({ status: "published" }));
  const offers = r.data || [];
  const [search, setSearch] = useState(params.get("search") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [date, setDate] = useState(params.get("date") || "");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("new");
  const cities = Array.from(new Set(offers.map((o) => o.destination.city)));
  const rows = offers
    .filter(
      (o) =>
        (
          o.title +
          " " +
          o.title_ar +
          " " +
          o.description +
          " " +
          o.destination.city +
          " " +
          o.destination.city_ar
        )
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!city || city === o.destination.city) &&
        (!tag || o.tags.includes(tag)) &&
        (!date ||
          !o.departure_dates.length ||
          o.departure_dates.some((d) => d >= date)),
    )
    .sort((a, b) =>
      sort === "price"
        ? a.pricing.currency.localeCompare(b.pricing.currency) ||
          a.pricing.base_price - b.pricing.base_price
        : 0,
    );
  function reset() {
    setSearch("");
    setCity("");
    setDate("");
    setTag("");
    setParams({});
  }
  return (
    <PublicLayout>
      <section className="pt-5 pb-8">
        <div className="inline-flex rounded-full bg-[var(--secondary)] px-3 py-2 text-[10px] text-[var(--primary)] mb-5">
          {ar ? "استكشاف الرحلات" : "Explore trips"}
        </div>
        <h1 className="text-3xl sm:text-[42px] font-bold leading-relaxed">
          {site.content[ar ? "hero_title_ar" : "hero_title"]}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-3 mb-5">
          {site.content[ar ? "hero_text_ar" : "hero_text"]}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParams({ search, city, date });
          }}
          className="panel !p-3 flex flex-wrap gap-3"
        >
          <input
            className="flex-1 min-w-[220px]"
            aria-label="Search trips"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              ar ? "ابحث عن رحلة أو وجهة…" : "Search a trip or destination…"
            }
          />
          <select
            aria-label="Destination"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">{ar ? "كل الوجهات" : "All destinations"}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {ar
                  ? offers.find((o) => o.destination.city === c)?.destination
                      .city_ar || c
                  : c}
              </option>
            ))}
          </select>
          <input
            aria-label={ar ? "السفر ابتداءً من" : "Departing from"}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button type="submit">
            <Icon file="879c7" />
            {ar ? "ابحث الآن" : "Find trips"}
          </Button>
        </form>
        <div className="filters">
          <select
            aria-label="Trip category"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="">{ar ? "كل الرحلات" : "All trips"}</option>
            {Array.from(new Set(offers.flatMap((o) => o.tags))).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            aria-label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="new">{ar ? "الأحدث" : "Newest"}</option>
            <option value="price">
              {ar ? "السعر ضمن العملة" : "Price within currency"}
            </option>
          </select>
          {(search || city || tag || date) && (
            <Button variant="secondary" onClick={reset}>
              {ar ? "مسح الفلاتر" : "Clear filters"}
            </Button>
          )}
        </div>
      </section>
      <LoadingState {...r} retry={r.reload} />
      {!r.loading &&
        !r.error &&
        (rows.length ? (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rows.map((o) => (
              <Link
                key={o.id}
                to={"/offers/" + o.slug}
                className="offer-card hover:-translate-y-1 transition-transform"
              >
                {o.cover_image_url && (
                  <img
                    src={o.cover_image_url}
                    alt={ar ? o.title_ar : o.title}
                    loading="lazy"
                  />
                )}
                <div className="details">
                  <p>
                    {ar ? o.destination.city_ar : o.destination.city} ·{" "}
                    {o.duration_nights} {ar ? "ليالٍ" : "nights"}
                  </p>
                  <h2>{ar ? o.title_ar : o.title}</h2>
                  <p className="line-clamp-2">
                    {ar ? o.description_ar : o.description}
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-5">
                    <strong className="text-[var(--primary)]" dir="ltr">
                      {o.pricing.base_price.toLocaleString("en-US")}{" "}
                      {o.pricing.currency}
                    </strong>
                    <span className="text-xs">
                      {ar ? "تفاصيل الرحلة ←" : "View trip →"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="panel text-center py-8 min-h-[350px]">
            <h2>{ar ? "لا توجد رحلات مطابقة" : "No matching trips"}</h2>
            <img
              src="/assets/figma/a5489.png"
              alt=""
              className="w-[220px] h-[140px] object-contain mx-auto my-7"
            />
            <p className="text-xs text-[var(--muted-foreground)] mb-6">
              {ar
                ? "جرّب تغيير الوجهة أو التاريخ أو نوع الرحلة لمشاهدة خيارات أخرى."
                : "Try another destination, date or trip type."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={reset}>
                {ar ? "عرض جميع الرحلات" : "View all trips"}
              </Button>
              <Link
                to="/plan"
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
              >
                {ar ? "خطط رحلة مخصصة" : "Plan a custom trip"}
              </Link>
            </div>
          </section>
        ))}
    </PublicLayout>
  );
}
