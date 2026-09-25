export type LostReason = 'price' | 'timing' | 'competitor' | 'no_response' | 'availability' | 'other';

export interface QuoteRevision {
  id: string;
  quote_id: string;
  version: number;
  snapshot: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export interface SalesCloseout {
  lead_id: string;
  outcome: 'sold' | 'lost';
  booking_reference: string | null;
  sold_value: number | null;
  currency: string | null;
  lost_reason: LostReason | null;
  notes: string;
  closed_by: string;
  closed_at: string;
}
