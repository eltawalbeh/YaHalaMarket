export type QuoteStatus = "draft" | "sent" | "viewed" | "under_discussion" | "accepted" | "expired" | "withdrawn"

export interface QuoteLineItem {
  label: string
  label_ar: string
  quantity: number
  unit_price: number
  currency: string
}

export interface Quote {
  id: string
  token: string
  status: QuoteStatus
  lead_id: string
  offer_id: string | null
  assigned_to: string
  line_items: QuoteLineItem[]
  total_price: number
  currency: string
  valid_until: string
  notes: string
  notes_ar: string
  sent_at: string | null
  viewed_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
}
