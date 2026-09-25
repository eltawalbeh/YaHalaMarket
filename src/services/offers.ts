import type { Offer, OfferStatus } from '@/types';
import { mockOffers } from '@/data';
import { supabase } from '@/lib/supabase/client';

export interface OffersService {
  list(filters?: { status?: OfferStatus }): Promise<Offer[]>;
  getBySlug(slug: string): Promise<Offer | null>;
  getById(id: string): Promise<Offer | null>;
  create(data: Omit<Offer, 'id' | 'created_at' | 'updated_at'>): Promise<Offer>;
  update(id: string, data: Partial<Offer>): Promise<Offer>;
  delete(id: string): Promise<void>;
}

export const offersService: OffersService = {
  async list(filters) {
    if (!supabase) {
      let results = [...mockOffers];
      if (filters?.status) results = results.filter((offer) => offer.status === filters.status);
      return results;
    }
    let query = supabase.from('offers').select('*').order('created_at', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    const result = await query;
    if (result.error) throw new Error(result.error.message);
    return (result.data ?? []) as Offer[];
  },

  async getBySlug(slug) {
    if (!supabase) return mockOffers.find((offer) => offer.slug === slug) ?? null;
    const result = await supabase.from('offers').select('*').eq('slug', slug).maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data as Offer | null;
  },

  async getById(id) {
    if (!supabase) return mockOffers.find((offer) => offer.id === id) ?? null;
    const result = await supabase.from('offers').select('*').eq('id', id).maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data as Offer | null;
  },

  async create(data) {
    if (!supabase) {
      const offer: Offer = { ...data, id: `off-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockOffers.push(offer);
      return offer;
    }
    const result = await supabase.from('offers').insert(data).select().single();
    if (result.error) throw new Error(result.error.message);
    return result.data as Offer;
  },

  async update(id, data) {
    if (!supabase) {
      const idx = mockOffers.findIndex((offer) => offer.id === id);
      if (idx === -1) throw new Error(`Offer ${id} not found`);
      mockOffers[idx] = { ...mockOffers[idx], ...data, updated_at: new Date().toISOString() };
      return mockOffers[idx];
    }
    const result = await supabase.from('offers').update(data).eq('id', id).select().single();
    if (result.error) throw new Error(result.error.message);
    return result.data as Offer;
  },

  async delete(id) {
    if (!supabase) {
      const idx = mockOffers.findIndex((offer) => offer.id === id);
      if (idx !== -1) mockOffers.splice(idx, 1);
      return;
    }
    const result = await supabase.from('offers').delete().eq('id', id);
    if (result.error) throw new Error(result.error.message);
  },
};
