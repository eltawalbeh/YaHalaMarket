import type { Quote, QuoteStatus } from "@/types";
import { db, request } from "@/lib/request";
import { listAll } from "./shared";
export type PublicQuote = Pick<
  Quote,
  | "status"
  | "line_items"
  | "total_price"
  | "currency"
  | "valid_until"
  | "notes"
  | "notes_ar"
  | "accepted_at"
  | "offer_id"
> & {
  reference: string;
};
export const quotesService = {
  list(filters?: { status?: QuoteStatus; lead_id?: string }) {
    return listAll<Quote>("quotes", (q) => {
      if (filters?.status) q = q.eq("status", filters.status);
      if (filters?.lead_id) q = q.eq("lead_id", filters.lead_id);
      return q;
    });
  },
  async getById(id: string): Promise<Quote | null> {
    return request(db().from("quotes").select("*").eq("id", id).maybeSingle());
  },
  async getByToken(
    token: string,
    action = "read",
  ): Promise<PublicQuote | null> {
    return request(
      db().rpc("get_public_quote", { p_token: token, p_action: action }),
    );
  },
  async create(
    data: Omit<Quote, "id" | "token" | "created_at" | "updated_at">,
  ): Promise<Quote> {
    return request(db().from("quotes").insert(data).select().single());
  },
  async update(id: string, data: Partial<Quote>): Promise<Quote> {
    return request(
      db().from("quotes").update(data).eq("id", id).select().single(),
    );
  },
  async updateStatus(id: string, status: QuoteStatus) {
    return this.update(id, { status });
  },
};
