import type { Quote, QuoteStatus } from '@/types';
import { generateToken } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

export interface QuotesService {
  list(filters?: { status?: QuoteStatus; lead_id?: string }): Promise<Quote[]>;
  getById(id: string): Promise<Quote | null>;
  getByToken(token: string): Promise<Quote | null>;
  create(data: Omit<Quote, 'id' | 'token' | 'created_at' | 'updated_at'>): Promise<Quote>;
  update(id: string, data: Partial<Quote>): Promise<Quote>;
  updateStatus(id: string, status: QuoteStatus): Promise<Quote>;
}

export const mockQuotes: Quote[] = [];

export const quotesService: QuotesService = {
  async list(filters) {
    if (!supabase) {
      let results = [...mockQuotes];
      if (filters?.status) results = results.filter((quote) => quote.status === filters.status);
      if (filters?.lead_id) results = results.filter((quote) => quote.lead_id === filters.lead_id);
      return results;
    }
    let query = supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.lead_id) query = query.eq('lead_id', filters.lead_id);
    const result = await query;
    if (result.error) throw new Error(result.error.message);
    return (result.data ?? []) as Quote[];
  },

  async getById(id) {
    if (!supabase) return mockQuotes.find((quote) => quote.id === id) ?? null;
    const result = await supabase.from('quotes').select('*').eq('id', id).maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data as Quote | null;
  },

  async getByToken(token) {
    if (!supabase) return mockQuotes.find((quote) => quote.token === token) ?? null;
    const result = await supabase.from('quotes').select('*').eq('token', token).maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data as Quote | null;
  },

  async create(data) {
    if (!supabase) {
      const quote: Quote = { ...data, id: `qt-${Date.now()}`, token: generateToken(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockQuotes.push(quote);
      return quote;
    }
    const result = await supabase.from('quotes').insert(data).select().single();
    if (result.error) throw new Error(result.error.message);
    return result.data as Quote;
  },

  async update(id, data) {
    if (!supabase) {
      const idx = mockQuotes.findIndex((quote) => quote.id === id);
      if (idx === -1) throw new Error(`Quote ${id} not found`);
      mockQuotes[idx] = { ...mockQuotes[idx], ...data, updated_at: new Date().toISOString() };
      return mockQuotes[idx];
    }
    const result = await supabase.from('quotes').update(data).eq('id', id).select().single();
    if (result.error) throw new Error(result.error.message);
    return result.data as Quote;
  },

  async updateStatus(id, status) {
    return this.update(id, { status });
  },
};
