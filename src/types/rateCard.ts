export interface HotelRateCard {
  id: string
  hotel_id: string
  supplier_name: string
  room_type: string
  meal_plan: string
  valid_from: string
  valid_until: string
  currency: string
  cost_price: number
  selling_price: number
  occupancy: number
  document_ids: string[]
  status: "draft" | "active" | "expired" | "archived"
  created_by: string
  approved_by: string | null
  created_at: string
  updated_at: string
}
