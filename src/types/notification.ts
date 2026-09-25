export type NotificationType =
  | 'lead_new'
  | 'lead_assigned'
  | 'quote_viewed'
  | 'quote_accepted'
  | 'offer_published'
  | 'offer_expired'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  title_ar: string;
  body: string;
  body_ar: string;
  resource: string | null;
  resource_id: string | null;
  is_read: boolean;
  created_at: string;
}
