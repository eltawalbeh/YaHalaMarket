import type { Quote, QuoteStatus } from '@/types';
import { generateToken } from '@/lib/utils';

const mockQuotes: Quote[] = [];

export interface QuotesService {
  list(filters?: { status?: QuoteStatus; lead_id?: string }): Promise<Quote[]>;
  getById(id: string): Promise<Quote | null>;
  getByToken(token: string): Promise<Quote | null>;
  create(data: Omit<Quote, 'id' | 'token' | 'created_at' | 'updated_at'>): Promise<Quote>;
  update(id: string, data: Partial<Quote>): Promise<Quote>;
  updateStatus(id: string, status: QuoteStatus): Promise<Quote>;
}

export const quotesService: QuotesService = {
  async list(filters) {
    let results = [...mockQuotes];
    if (filters?.status) results = results.filter((q) => q.status === filters.status);
    if (filters?.lead_id) results = results.filter((q) => q.lead_id === filters.lead_id);
    return results;
  },

  async getById(id) {
    return mockQuotes.find((q) => q.id === id) ?? null;
  },

  async getByToken(token) {
    return mockQuotes.find((q) => q.token === token) ?? null;
  },

  async create(data) {
    const quote: Quote = {
      ...data,
      id: `qt-${Date.now()}`,
      token: generateToken(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockQuotes.push(quote);
    return quote;
  },

  async update(id, data) {
    const idx = mockQuotes.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error(`Quote ${id} not found`);
    mockQuotes[idx] = { ...mockQuotes[idx], ...data, updated_at: new Date().toISOString() };
    return mockQuotes[idx];
  },

  async updateStatus(id, status) {
    return this.update(id, { status });
  },
};
