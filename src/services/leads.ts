import type { Lead, LeadStatus } from "@/types"
import { mockLeads } from "@/data"
import { supabase } from "@/lib/supabase/client"

export interface LeadsService {
  list(filters?: { status?: LeadStatus; assigned_to?: string }): Promise<Lead[]>
  getById(id: string): Promise<Lead | null>
  create(data: Omit<Lead, "id" | "created_at" | "updated_at">): Promise<Lead>
  update(id: string, data: Partial<Lead>): Promise<Lead>
  updateStatus(id: string, status: LeadStatus): Promise<Lead>
}

export const leadsService: LeadsService = {
  async list(filters) {
    if (!supabase) {
      let results = [...mockLeads]
      if (filters?.status) results = results.filter((lead) => lead.status === filters.status)
      if (filters?.assigned_to) results = results.filter((lead) => lead.assigned_to === filters.assigned_to)
      return results
    }
    let query = supabase.from("leads").select("*").order("created_at", { ascending: false })
    if (filters?.status) query = query.eq("status", filters.status)
    if (filters?.assigned_to) query = query.eq("assigned_to", filters.assigned_to)
    const result = await query
    if (result.error) throw new Error(result.error.message)
    return (result.data ?? []) as Lead[]
  },

  async getById(id) {
    if (!supabase) return mockLeads.find((lead) => lead.id === id) ?? null
    const result = await supabase.from("leads").select("*").eq("id", id).maybeSingle()
    if (result.error) throw new Error(result.error.message)
    return result.data as Lead | null
  },

  async create(data) {
    if (!supabase) {
      const lead: Lead = { ...data, id: `ld-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockLeads.push(lead)
      return lead
    }

    const result = await supabase.rpc("create_public_lead", {
      p_full_name: data.full_name,
      p_phone: data.phone,
      p_email: data.email,
      p_offer_id: data.offer_id,
      p_notes: data.notes,
      p_pax_count: data.pax_count,
      p_preferred_dates: data.preferred_dates,
      p_budget_range: data.budget_range,
    })
    if (result.error) throw new Error(result.error.message)
    const row = Array.isArray(result.data) ? result.data[0] : result.data
    if (!row) throw new Error("The lead was not returned after submission")
    return row as Lead
  },

  async update(id, data) {
    if (!supabase) {
      const idx = mockLeads.findIndex((lead) => lead.id === id)
      if (idx === -1) throw new Error(`Lead ${id} not found`)
      mockLeads[idx] = { ...mockLeads[idx], ...data, updated_at: new Date().toISOString() }
      return mockLeads[idx]
    }
    const result = await supabase.from("leads").update(data).eq("id", id).select().single()
    if (result.error) throw new Error(result.error.message)
    return result.data as Lead
  },

  async updateStatus(id, status) {
    return this.update(id, { status })
  },
}

