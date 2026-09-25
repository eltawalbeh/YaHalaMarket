import type { Lead, LeadStatus } from '@/types';
import { mockLeads } from '@/data';

export interface LeadsService {
  list(filters?: { status?: LeadStatus; assigned_to?: string }): Promise<Lead[]>;
  getById(id: string): Promise<Lead | null>;
  create(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead>;
  update(id: string, data: Partial<Lead>): Promise<Lead>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead>;
}

export const leadsService: LeadsService = {
  async list(filters) {
    let results = [...mockLeads];
    if (filters?.status) results = results.filter((l) => l.status === filters.status);
    if (filters?.assigned_to) results = results.filter((l) => l.assigned_to === filters.assigned_to);
    return results;
  },

  async getById(id) {
    return mockLeads.find((l) => l.id === id) ?? null;
  },

  async create(data) {
    const lead: Lead = {
      ...data,
      id: `ld-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockLeads.push(lead);
    return lead;
  },

  async update(id, data) {
    const idx = mockLeads.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found`);
    mockLeads[idx] = { ...mockLeads[idx], ...data, updated_at: new Date().toISOString() };
    return mockLeads[idx];
  },

  async updateStatus(id, status) {
    return this.update(id, { status });
  },
};
