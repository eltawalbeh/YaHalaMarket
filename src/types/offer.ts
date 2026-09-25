export type OfferStatus = 'draft' | 'in_review' | 'published' | 'expired' | 'archived';

export interface OfferDestination {
  city: string;
  city_ar: string;
  country: string;
  country_ar: string;
  country_code: string;
}

export interface OfferPricing {
  base_price: number;
  currency: string;
  per_person: boolean;
  includes_flights: boolean;
  includes_hotel: boolean;
  includes_transfers: boolean;
}

export interface Offer {
  id: string;
  slug: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  status: OfferStatus;
  destination: OfferDestination;
  pricing: OfferPricing;
  duration_nights: number;
  departure_dates: string[];
  hotel_ids: string[];
  cover_image_url: string | null;
  tags: string[];
  tags_ar: string[];
  created_by: string;
  reviewed_by: string | null;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
