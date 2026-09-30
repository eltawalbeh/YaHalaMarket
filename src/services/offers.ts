import type { Offer, OfferStatus } from "@/types";
import { db, request } from "@/lib/request";
import { listAll } from "./shared";
export const offersService = {
  async list(filters?: { status?: OfferStatus }) {
    return listAll<Offer>("offers", (q) => {
      if (filters?.status) q = q.eq("status", filters.status);
      if (filters?.status === "published")
        q = q.or(
          "expires_at.is.null,expires_at.gt." + new Date().toISOString(),
        );
      return q;
    });
  },
  async getBySlug(slug: string): Promise<Offer | null> {
    return request(publishedOfferQuery().eq("slug", slug).maybeSingle());
  },
  async getBySelector(selector: string): Promise<Offer | null> {
    const raw = decodeURIComponent(selector).replace(/\+/g, " ").trim();
    const slug = raw
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
    const bySlug = await this.getBySlug(raw);
    if (bySlug) return bySlug;
    if (slug && slug !== raw) {
      const normalized = await this.getBySlug(slug);
      if (normalized) return normalized;
    }
    const byTitle = await request(
      publishedOfferQuery().ilike("title", raw).maybeSingle(),
    );
    if (byTitle) return byTitle;
    return request(
      publishedOfferQuery().ilike("title_ar", raw).maybeSingle(),
    );
  },
  async getById(id: string): Promise<Offer | null> {
    return request(db().from("offers").select("*").eq("id", id).maybeSingle());
  },
  async create(
    data: Omit<Offer, "id" | "created_at" | "updated_at">,
  ): Promise<Offer> {
    return request(db().from("offers").insert(data).select().single());
  },
  async update(id: string, data: Partial<Offer>): Promise<Offer> {
    return request(
      db().from("offers").update(data).eq("id", id).select().single(),
    );
  },
};

function publishedOfferQuery() {
  return db()
    .from("offers")
    .select("*")
    .eq("status", "published")
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());
}
