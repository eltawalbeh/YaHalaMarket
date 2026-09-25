import { useEffect, useState } from 'react';
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

  useEffect(() => {
    offersService.list({ status: 'published' }).then(setOffers);
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="text-center py-12 mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-3">
          {t('marketTitle', lang)}
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-md mx-auto">
          {t('marketSubtitle', lang)}
        </p>
      </section>

      {/* Offer grid */}
      <section>
        {offers.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)] py-16">{t('noResults', lang)}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function OfferCard({ offer, lang }: { offer: Offer; lang: 'ar' | 'en' }) {
  const title = lang === 'ar' ? offer.title_ar : offer.title;
  const city  = lang === 'ar' ? offer.destination.city_ar : offer.destination.city;

  return (
    <Card padding={false} className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Placeholder image area */}
      <div className="h-44 bg-[var(--muted)] flex items-center justify-center">
        <span className="text-3xl opacity-20">✈</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-[var(--muted-foreground)] mb-1">{city} · {offer.duration_nights} {t('nights', lang)}</p>
        <h2 className="font-semibold text-[var(--foreground)] leading-snug mb-3">{title}</h2>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[var(--primary)] numerals-latin">
            {formatPrice(offer.pricing.base_price, offer.pricing.currency)}
          </span>
          <Link
            to={PUBLIC_ROUTES.offerDetail(offer.slug)}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {t('viewOffer', lang)} ←
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {offer.pricing.includes_flights && (
            <Badge variant="teal">{t('includesFlights', lang)}</Badge>
          )}
          {offer.pricing.includes_hotel && (
            <Badge variant="gray">{t('includesHotel', lang)}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
