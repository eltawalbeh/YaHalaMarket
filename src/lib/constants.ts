import type { OfferStatus, LeadStatus, QuoteStatus, UserRole } from '@/types';

export const OFFER_STATUSES: Record<OfferStatus, { label: string; label_ar: string; color: string }> = {
  draft:      { label: 'Draft',      label_ar: 'مسودة',         color: 'gray' },
  in_review:  { label: 'In Review',  label_ar: 'قيد المراجعة',  color: 'yellow' },
  published:  { label: 'Published',  label_ar: 'منشور',         color: 'green' },
  expired:    { label: 'Expired',    label_ar: 'منتهي الصلاحية', color: 'red' },
  archived:   { label: 'Archived',   label_ar: 'مؤرشف',         color: 'stone' },
};

export const LEAD_STATUSES: Record<LeadStatus, { label: string; label_ar: string; color: string }> = {
  new:               { label: 'New',               label_ar: 'جديد',              color: 'blue' },
  assigned:          { label: 'Assigned',          label_ar: 'معيّن',             color: 'indigo' },
  contacted:         { label: 'Contacted',         label_ar: 'تم التواصل',        color: 'purple' },
  quote_in_progress: { label: 'Quote in Progress', label_ar: 'عرض سعر جارٍ',     color: 'orange' },
  quote_sent:        { label: 'Quote Sent',        label_ar: 'عرض سعر مرسل',     color: 'teal' },
  follow_up:         { label: 'Follow-up',         label_ar: 'متابعة',            color: 'cyan' },
  sold:              { label: 'Sold',              label_ar: 'تم البيع',          color: 'green' },
  lost:              { label: 'Lost',              label_ar: 'خسارة',             color: 'red' },
};

export const QUOTE_STATUSES: Record<QuoteStatus, { label: string; label_ar: string; color: string }> = {
  draft:            { label: 'Draft',            label_ar: 'مسودة',             color: 'gray' },
  sent:             { label: 'Sent',             label_ar: 'مرسل',              color: 'blue' },
  viewed:           { label: 'Viewed',           label_ar: 'تمت المشاهدة',      color: 'indigo' },
  under_discussion: { label: 'Under Discussion', label_ar: 'قيد النقاش',        color: 'yellow' },
  accepted:         { label: 'Accepted',         label_ar: 'مقبول',             color: 'green' },
  expired:          { label: 'Expired',          label_ar: 'منتهي الصلاحية',    color: 'red' },
  withdrawn:        { label: 'Withdrawn',        label_ar: 'مسحوب',             color: 'stone' },
};

export const USER_ROLES: Record<UserRole, { label: string; label_ar: string }> = {
  super_admin: { label: 'Super Admin', label_ar: 'مدير عام' },
  manager:     { label: 'Manager',     label_ar: 'مدير' },
  staff:       { label: 'Staff',       label_ar: 'موظف' },
};

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ar';
export const DEFAULT_CURRENCY = 'SAR';
export const CURRENCY_SYMBOL: Record<string, string> = {
  SAR: '﷼',
  AED: 'د.إ',
  USD: '$',
  EUR: '€',
};
