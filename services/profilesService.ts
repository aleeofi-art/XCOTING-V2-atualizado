import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export const profilesService = {
  getAll: async (): Promise<Profile[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)  // ← FILTRO CRÍTICO
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  create: async (profile: Partial<Profile>): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ ...profile, user_id: user.id }])  // ← ADICIONA user_id
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Partial<Profile>): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)  // ← SEGURANÇA: só atualiza se for dono
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)  // ← SEGURANÇA: só deleta se for dono
    
    if (error) throw error
  }
}
