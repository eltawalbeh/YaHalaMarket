import type { Hotel } from '@/types';
import { mockHotels } from '@/data';

export interface HotelsService {
  list(filters?: { country_code?: string; is_active?: boolean }): Promise<Hotel[]>;
  getById(id: string): Promise<Hotel | null>;
  create(data: Omit<Hotel, 'id' | 'created_at' | 'updated_at'>): Promise<Hotel>;
  update(id: string, data: Partial<Hotel>): Promise<Hotel>;
}

export const hotelsService: HotelsService = {
  async list(filters) {
    let results = [...mockHotels];
    if (filters?.country_code) {
      results = results.filter((h) => h.destination_country_code === filters.country_code);
    }
    if (filters?.is_active !== undefined) {
      results = results.filter((h) => h.is_active === filters.is_active);
    }
    return results;
  },

  async getById(id) {
    return mockHotels.find((h) => h.id === id) ?? null;
  },

  async create(data) {
    const hotel: Hotel = {
      ...data,
      id: `h-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockHotels.push(hotel);
    return hotel;
  },

  async update(id, data) {
    const idx = mockHotels.findIndex((h) => h.id === id);
    if (idx === -1) throw new Error(`Hotel ${id} not found`);
    mockHotels[idx] = { ...mockHotels[idx], ...data, updated_at: new Date().toISOString() };
    return mockHotels[idx];
  },
};
