import type { Offer, OfferStatus } from '@/types';
import { mockOffers } from '@/data';

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
    let results = [...mockOffers];
    if (filters?.status) {
      results = results.filter((o) => o.status === filters.status);
    }
    return results;
  },

  async getBySlug(slug) {
    return mockOffers.find((o) => o.slug === slug) ?? null;
  },

  async getById(id) {
    return mockOffers.find((o) => o.id === id) ?? null;
  },

  async create(data) {
    const offer: Offer = {
      ...data,
      id: `off-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockOffers.push(offer);
    return offer;
  },

  async update(id, data) {
    const idx = mockOffers.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error(`Offer ${id} not found`);
    mockOffers[idx] = { ...mockOffers[idx], ...data, updated_at: new Date().toISOString() };
    return mockOffers[idx];
  },

  async delete(id) {
    const idx = mockOffers.findIndex((o) => o.id === id);
    if (idx !== -1) mockOffers.splice(idx, 1);
  },
};
