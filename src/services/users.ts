import type { User, UserRole } from '@/types';
import { mockUsers } from '@/data';

export interface UsersService {
  list(filters?: { role?: UserRole; is_active?: boolean }): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
}

export const usersService: UsersService = {
  async list(filters) {
    let results = [...mockUsers];
    if (filters?.role) results = results.filter((u) => u.role === filters.role);
    if (filters?.is_active !== undefined) {
      results = results.filter((u) => u.is_active === filters.is_active);
    }
    return results;
  },

  async getById(id) {
    return mockUsers.find((u) => u.id === id) ?? null;
  },

  async getByEmail(email) {
    return mockUsers.find((u) => u.email === email) ?? null;
  },

  async update(id, data) {
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    mockUsers[idx] = { ...mockUsers[idx], ...data, updated_at: new Date().toISOString() };
    return mockUsers[idx];
  },
};
