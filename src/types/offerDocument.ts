export type OfferDocumentVisibility = 'internal' | 'public';

export interface OfferDocument {
  id: string;
  offer_id: string | null;
  hotel_id: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string;
  visibility: OfferDocumentVisibility;
  uploaded_by: string;
  created_at: string;
}
