import type { Hotel } from "@/types"
import { mockHotels } from "@/data"
import { supabase } from "@/lib/supabase/client"

export interface HotelsService {
  list(filters?: {
    country_code?: string
    is_active?: boolean
  }): Promise<Hotel[]>
  getById(id: string): Promise<Hotel | null>
  create(data: Omit<Hotel, "id" | "created_at" | "updated_at">): Promise<Hotel>
  update(id: string, data: Partial<Hotel>): Promise<Hotel>
}

export const hotelsService: HotelsService = {
  async list(filters) {
    if (!supabase) {
      let results = [...mockHotels]
      if (filters?.country_code)
        results = results.filter(
          (hotel) => hotel.destination_country_code === filters.country_code,
        )
      if (filters?.is_active !== undefined)
        results = results.filter(
          (hotel) => hotel.is_active === filters.is_active,
        )
      return results
    }
    let query = supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false })
    if (filters?.country_code)
      query = query.eq("destination_country_code", filters.country_code)
    if (filters?.is_active !== undefined)
      query = query.eq("is_active", filters.is_active)
    const result = await query
    if (result.error) throw new Error(result.error.message)
    return (result.data ?? []) as Hotel[]
  },

  async getById(id) {
    if (!supabase) return mockHotels.find((hotel) => hotel.id === id) ?? null
    const result = await supabase
      .from("hotels")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (result.error) throw new Error(result.error.message)
    return result.data as Hotel | null
  },

  async create(data) {
    if (!supabase) {
      const hotel: Hotel = {
        ...data,
        id: `h-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockHotels.push(hotel)
      return hotel
    }
    const result = await supabase.from("hotels").insert(data).select().single()
    if (result.error) throw new Error(result.error.message)
    return result.data as Hotel
  },

  async update(id, data) {
    if (!supabase) {
      const idx = mockHotels.findIndex((hotel) => hotel.id === id)
      if (idx === -1) throw new Error(`Hotel ${id} not found`)
      mockHotels[idx] = {
        ...mockHotels[idx],
        ...data,
        updated_at: new Date().toISOString(),
      }
      return mockHotels[idx]
    }
    const result = await supabase
      .from("hotels")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (result.error) throw new Error(result.error.message)
    return result.data as Hotel
  },
}
