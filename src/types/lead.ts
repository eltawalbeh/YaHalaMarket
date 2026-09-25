export type LeadStatus = 'new' | 'assigned' | 'contacted' | 'quote_in_progress' | 'quote_sent' | 'follow_up' | 'sold' | 'lost';
export type LeadSource = 'website' | 'whatsapp' | 'referral' | 'direct' | 'social' | 'other';

export interface Lead {
  id: string;
  reference_id?: string;
  full_name: string;
  phone: string;
  email: string | null;
  status: LeadStatus;
  source: LeadSource;
  offer_id: string | null;
  assigned_to: string | null;
  notes: string;
  pax_count: number;
  preferred_dates: string[];
  budget_range: string | null;
  created_at: string;
  updated_at: string;
}
