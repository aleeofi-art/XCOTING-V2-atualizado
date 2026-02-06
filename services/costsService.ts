import { supabase } from '../lib/supabase'
import type { OperationalCost } from '../types'

export const costsService = {
  getAll: async (): Promise<OperationalCost[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    
    const { data, error } = await supabase
      .from('operational_costs')
      .select('*')
      .eq('user_id', user.id)  // ← FILTRO
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  create: async (cost: Partial<OperationalCost>): Promise<OperationalCost> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { data, error } = await supabase
      .from('operational_costs')
      .insert([{ ...cost, user_id: user.id }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Partial<OperationalCost>): Promise<OperationalCost> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { data, error } = await supabase
      .from('operational_costs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { error } = await supabase
      .from('operational_costs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}
