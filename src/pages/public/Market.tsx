import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/app/providers/LangContext';
import { t } from '@/lib/i18n';
import { offersService } from '@/services';
import { formatPrice } from '@/lib/utils';
import { PUBLIC_ROUTES } from '@/lib/routes';
import type { Offer } from '@/types';

export default function Market() {
  const { lang } = useLang();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState('all');

  useEffect(() => {
    offersService.list({ status: 'published' }).then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  const destinations = useMemo(() => {
    const values = offers.map((offer) =>
      lang === 'ar' ? offer.destination.city_ar : offer.destination.city,
    );
    return [...new Set(values)];
  }, [offers, lang]);

  const filteredOffers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return offers.filter((offer) => {
      const title = (lang === 'ar' ? offer.title_ar : offer.title).toLocaleLowerCase();
      const city = (lang === 'ar' ? offer.destination.city_ar : offer.destination.city).toLocaleLowerCase();
      const matchesQuery = !normalizedQuery || title.includes(normalizedQuery) || city.includes(normalizedQuery);
      const selectedCity = lang === 'ar' ? offer.destination.city_ar : offer.destination.city;
      return matchesQuery && (destination === 'all' || selectedCity === destination);
    });
  }, [offers, query, destination, lang]);

  return (
    <PublicLayout>
      <section className="text-center py-10 sm:py-14">
        <p className="text-sm font-medium text-[var(--primary)] mb-3">market.yahala.co</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-3">
          {t('marketTitle', lang)}
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-md mx-auto">
          {t('marketSubtitle', lang)}
        </p>
      </section>

      <section aria-label={lang === 'ar' ? 'البحث والتصفية' : 'Search and filters'} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <label className="sr-only" htmlFor="offer-search">
            {lang === 'ar' ? 'ابحث عن وجهة أو باقة' : 'Search destination or offer'}
          </label>
          <input
            id="offer-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={lang === 'ar' ? 'ابحث عن وجهة أو باقة' : 'Search destination or offer'}
            className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <label className="sr-only" htmlFor="destination-filter">
            {lang === 'ar' ? 'الوجهة' : 'Destination'}
          </label>
          <select
            id="destination-filter"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="all">{lang === 'ar' ? 'كل الوجهات' : 'All destinations'}</option>
            {destinations.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
      </section>

      <section>
        {loading ? (
          <p className="text-center text-[var(--muted-foreground)] py-16">{t('loading', lang)}</p>
        ) : filteredOffers.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)] py-16">{t('noResults', lang)}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOffers.map((offer) => <OfferCard key={offer.id} offer={offer} lang={lang} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function OfferCard({ offer, lang }: { offer: Offer; lang: 'ar' | 'en' }) {
  const title = lang === 'ar' ? offer.title_ar : offer.title;
  const city = lang === 'ar' ? offer.destination.city_ar : offer.destination.city;

  return (
    <Card padding={false} className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-44 bg-[var(--muted)] flex items-center justify-center">
        <span className="text-3xl opacity-20" aria-hidden="true">✈</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-[var(--muted-foreground)] mb-1">{city} · {offer.duration_nights} {t('nights', lang)}</p>
        <h2 className="font-semibold text-[var(--foreground)] leading-snug mb-3">{title}</h2>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[var(--primary)] numerals-latin">{formatPrice(offer.pricing.base_price, offer.pricing.currency)}</span>
          <Link to={PUBLIC_ROUTES.offerDetail(offer.slug)} className="text-sm text-[var(--primary)] hover:underline">
            {t('viewOffer', lang)} ←
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {offer.pricing.includes_flights && <Badge variant="teal">{t('includesFlights', lang)}</Badge>}
          {offer.pricing.includes_hotel && <Badge variant="gray">{t('includesHotel', lang)}</Badge>}
        </div>
      </div>
    </Card>
  );
}
