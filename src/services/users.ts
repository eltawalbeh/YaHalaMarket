import type { User, UserRole } from "@/types";
import { db, request } from "@/lib/request";
import { listAll } from "./shared";
export const usersService = {
  list(filters?: { role?: UserRole; is_active?: boolean }) {
    return listAll<User>("profiles", (q) => {
      if (filters?.role) q = q.eq("role", filters.role);
      if (filters?.is_active !== undefined)
        q = q.eq("is_active", filters.is_active);
      return q;
    });
  },
  async getById(id: string): Promise<User | null> {
    return request(
      db().from("profiles").select("*").eq("id", id).maybeSingle(),
    );
  },
  async update(id: string, data: Partial<User>): Promise<User> {
    return request(
      db().from("profiles").update(data).eq("id", id).select().single(),
    );
  },
  async create(data: {
    email: string;
    password: string;
    full_name: string;
    full_name_ar: string;
    role: UserRole;
  }) {
    const { data: result, error } = await db().functions.invoke("market-team", {
      body: data,
    });
    if (error) {
      const response = error.context;
      if (response instanceof Response) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || error.message);
      }
      throw error;
    }
    if (result?.error) throw new Error(result.error);
    return result as User;
  },
};
