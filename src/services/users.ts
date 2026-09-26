import type { User, UserRole } from "@/types"
import { mockUsers } from "@/data"
import { supabase } from "@/lib/supabase/client"

export interface UsersService {
  list(filters?: { role?: UserRole is_active?: boolean }): Promise<User[]>
  getById(id: string): Promise<User | null>
  getByEmail(email: string): Promise<User | null>
  update(id: string, data: Partial<User>): Promise<User>
}

export const usersService: UsersService = {
  async list(filters) {
    if (!supabase) {
      let results = [...mockUsers]
      if (filters?.role)
        results = results.filter((user) => user.role === filters.role)
      if (filters?.is_active !== undefined)
        results = results.filter((user) => user.is_active === filters.is_active)
      return results
    }
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    if (filters?.role) query = query.eq("role", filters.role)
    if (filters?.is_active !== undefined)
      query = query.eq("is_active", filters.is_active)
    const result = await query
    if (result.error) throw new Error(result.error.message)
    return (result.data ?? []) as User[]
  },

  async getById(id) {
    if (!supabase) return mockUsers.find((user) => user.id === id) ?? null
    const result = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (result.error) throw new Error(result.error.message)
    return result.data as User | null
  },

  async getByEmail(email) {
    if (!supabase) return mockUsers.find((user) => user.email === email) ?? null
    const result = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle()
    if (result.error) throw new Error(result.error.message)
    return result.data as User | null
  },

  async update(id, data) {
    if (!supabase) {
      const idx = mockUsers.findIndex((user) => user.id === id)
      if (idx === -1) throw new Error(`User ${id} not found`)
      mockUsers[idx] = {
        ...mockUsers[idx],
        ...data,
        updated_at: new Date().toISOString(),
      }
      return mockUsers[idx]
    }
    const result = await supabase
      .from("profiles")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (result.error) throw new Error(result.error.message)
    return result.data as User
  },
}
