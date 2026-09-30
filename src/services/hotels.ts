import type { Hotel } from "@/types";
import type { HotelRateCard } from "@/types/rateCard";
import { db, request } from "@/lib/request";
import { listAll } from "./shared";
export const hotelsService = {
  list(filters?: { country_code?: string; is_active?: boolean }) {
    return listAll<Hotel>("hotels", (q) => {
      if (filters?.country_code)
        q = q.eq("destination_country_code", filters.country_code);
      if (filters?.is_active !== undefined)
        q = q.eq("is_active", filters.is_active);
      return q;
    });
  },
  async getById(id: string): Promise<Hotel | null> {
    return request(db().from("hotels").select("*").eq("id", id).maybeSingle());
  },
  async create(
    data: Omit<Hotel, "id" | "created_at" | "updated_at">,
  ): Promise<Hotel> {
    return request(db().from("hotels").insert(data).select().single());
  },
  async update(id: string, data: Partial<Hotel>): Promise<Hotel> {
    return request(
      db().from("hotels").update(data).eq("id", id).select().single(),
    );
  },
  rates(hotelId?: string) {
    return listAll<HotelRateCard>("hotel_rate_cards", (q) =>
      hotelId ? q.eq("hotel_id", hotelId) : q,
    );
  },
  async saveRate(data: Partial<HotelRateCard>) {
    const { id, ...fields } = data;
    return request(
      id
        ? db()
            .from("hotel_rate_cards")
            .update(fields)
            .eq("id", id)
            .select()
            .single()
        : db().from("hotel_rate_cards").insert(fields).select().single(),
    );
  },
};
