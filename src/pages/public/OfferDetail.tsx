import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/public/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/app/providers/LangContext';
import { t } from '@/lib/i18n';
import { offersService } from '@/services';
import { formatPrice } from '@/lib/utils';
import { PUBLIC_ROUTES } from '@/lib/routes';
import type { Offer } from '@/types';

export default function OfferDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLang();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    offersService.getBySlug(slug).then((o) => {
      setOffer(o);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <PublicLayout><p className="py-20 text-center text-[var(--muted-foreground)]">{t('loading', lang)}</p></PublicLayout>;
  if (!offer)  return <PublicLayout><p className="py-20 text-center text-[var(--muted-foreground)]">{t('noResults', lang)}</p></PublicLayout>;

  const title   = lang === 'ar' ? offer.title_ar   : offer.title;
  const desc    = lang === 'ar' ? offer.description_ar : offer.description;
  const city    = lang === 'ar' ? offer.destination.city_ar    : offer.destination.city;
  const country = lang === 'ar' ? offer.destination.country_ar : offer.destination.country;

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto">
        <Link to={PUBLIC_ROUTES.offers} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] mb-6 inline-block">
          ← {t('offers', lang)}
        </Link>

        {/* Cover placeholder */}
        <div className="h-64 rounded-[var(--radius)] bg-[var(--muted)] flex items-center justify-center mb-6">
          <span className="text-5xl opacity-20">✈</span>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-2">{city}, {country}</p>
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">{desc}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {offer.pricing.includes_flights   && <Badge variant="teal">{t('includesFlights', lang)}</Badge>}
          {offer.pricing.includes_hotel     && <Badge variant="gray">{t('includesHotel', lang)}</Badge>}
          {offer.pricing.includes_transfers && <Badge variant="blue">{t('includesTransfers', lang)}</Badge>}
        </div>

        <div className="border border-[var(--border)] rounded-[var(--radius)] p-5 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[var(--primary)] numerals-latin">
              {formatPrice(offer.pricing.base_price, offer.pricing.currency)}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {offer.duration_nights} {t('nights', lang)}
              {offer.pricing.per_person && ` · ${t('perPerson', lang)}`}
            </p>
          </div>
          <Button size="lg">{t('requestQuote', lang)}</Button>
        </div>
      </div>
    </PublicLayout>
  );
}
