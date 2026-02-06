import { supabase } from '../lib/supabase'
import type { Script } from '../types'

export const scriptsService = {
  getAll: async (): Promise<Script[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('user_id', user.id)  // ← FILTRO
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  create: async (script: Partial<Script>): Promise<Script> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { data, error } = await supabase
      .from('scripts')
      .insert([{ ...script, user_id: user.id }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Partial<Script>): Promise<Script> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { data, error } = await supabase
      .from('scripts')
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
      .from('scripts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}
