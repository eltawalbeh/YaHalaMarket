export type HotelStars = 1 | 2 | 3 | 4 | 5

export interface Hotel {
  id: string
  name: string
  name_ar: string
  destination_city: string
  destination_city_ar: string
  destination_country: string
  destination_country_code: string
  stars: HotelStars
  address: string
  address_ar: string
  check_in_time: string
  check_out_time: string
  amenities: string[]
  amenities_ar: string[]
  cover_image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
