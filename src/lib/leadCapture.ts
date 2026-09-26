import type { Lead, Offer } from "@/types"

export function createReferenceId(prefix = "YHM") {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14)
  return `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function buildLeadPayload(
  offer: Offer,
  input: Pick<Lead, "full_name" | "phone" | "email" | "pax_count" | "preferred_dates" | "budget_range" | "notes">,
) {
  return {
    ...input,
    offer_id: offer.id,
    status: "new" as const,
    source: "website" as const,
    assigned_to: null,
    reference_id: createReferenceId(),
  }
}

export function buildWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
}
