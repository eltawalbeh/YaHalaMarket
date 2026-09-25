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
    offersService.getBySlug(slug).then((value) => {
      setOffer(value);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <PublicLayout><p className="py-20 text-center text-[var(--muted-foreground)]">{t('loading', lang)}</p></PublicLayout>;
  if (!offer) return <PublicLayout><p className="py-20 text-center text-[var(--muted-foreground)]">{t('noResults', lang)}</p></PublicLayout>;

  const title = lang === 'ar' ? offer.title_ar : offer.title;
  const desc = lang === 'ar' ? offer.description_ar : offer.description;
  const city = lang === 'ar' ? offer.destination.city_ar : offer.destination.city;
  const country = lang === 'ar' ? offer.destination.country_ar : offer.destination.country;

  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto">
        <Link to={PUBLIC_ROUTES.offers} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] mb-6 inline-block">
          ← {t('offers', lang)}
        </Link>
        <div className="h-64 rounded-[var(--radius)] bg-[var(--muted)] flex items-center justify-center mb-6" role="img" aria-label={title}>
          <span className="text-5xl opacity-20" aria-hidden="true">✈</span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-2">{city}, {country}</p>
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">{desc}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {offer.pricing.includes_flights && <Badge variant="teal">{t('includesFlights', lang)}</Badge>}
          {offer.pricing.includes_hotel && <Badge variant="gray">{t('includesHotel', lang)}</Badge>}
          {offer.pricing.includes_transfers && <Badge variant="blue">{t('includesTransfers', lang)}</Badge>}
        </div>
        <section className="border border-[var(--border)] rounded-[var(--radius)] p-5 mb-8">
          <h2 className="font-semibold mb-4">{lang === 'ar' ? 'تفاصيل السعر' : 'Price details'}</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold text-[var(--primary)] numerals-latin">{formatPrice(offer.pricing.base_price, offer.pricing.currency)}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{offer.duration_nights} {t('nights', lang)}{offer.pricing.per_person ? ` · ${t('perPerson', lang)}` : ''}</p>
            </div>
            <Button size="lg">{t('requestQuote', lang)}</Button>
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <DetailBlock title={lang === 'ar' ? 'المشمول' : 'Included'} value={lang === 'ar' ? 'حسب تفاصيل العرض' : 'As listed in the offer'} />
          <DetailBlock title={lang === 'ar' ? 'الفنادق' : 'Hotels'} value={lang === 'ar' ? 'خيارات الفنادق تظهر في النسخة المتصلة بالبيانات' : 'Hotel options will be supplied by the connected data layer'} />
        </section>
      </article>
    </PublicLayout>
  );
}

function DetailBlock({ title, value }: { title: string; value: string }) {
  return <div className="border border-[var(--border)] rounded-[var(--radius)] p-4"><h2 className="font-semibold mb-2">{title}</h2><p className="text-sm text-[var(--muted-foreground)]">{value}</p></div>;
}
