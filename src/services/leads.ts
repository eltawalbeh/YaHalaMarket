import type { Lead, LeadStatus } from "@/types";
import { db, request } from "@/lib/request";
import { listAll } from "./shared";
export const leadsService = {
  list(filters?: { status?: LeadStatus; assigned_to?: string }) {
    return listAll<Lead>("leads", (q) => {
      if (filters?.status) q = q.eq("status", filters.status);
      if (filters?.assigned_to) q = q.eq("assigned_to", filters.assigned_to);
      return q;
    });
  },
  async getById(id: string): Promise<Lead | null> {
    return request(db().from("leads").select("*").eq("id", id).maybeSingle());
  },
  async create(
    data: Omit<Lead, "id" | "created_at" | "updated_at">,
  ): Promise<Lead> {
    const row = await request(
      db().rpc("submit_market_request", {
        p_full_name: data.full_name,
        p_phone: data.phone,
        p_email: data.email,
        p_offer_id: data.offer_id,
        p_notes: data.notes,
        p_pax_count: data.pax_count,
        p_preferred_dates: data.preferred_dates,
        p_budget_range: data.budget_range,
        p_submission_key: data.submission_key ?? null,
      }),
    );
    return (Array.isArray(row) ? row[0] : row) as Lead;
  },
  async createInternal(data: Partial<Lead>): Promise<Lead> {
    return request(db().from("leads").insert(data).select().single());
  },
  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    return request(
      db().from("leads").update(data).eq("id", id).select().single(),
    );
  },
  async updateStatus(id: string, status: LeadStatus) {
    return this.update(id, { status });
  },
};
