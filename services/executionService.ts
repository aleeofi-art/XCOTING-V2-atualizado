import { supabase } from '../lib/supabase'
import type { ScriptExecution } from '../types'

export const executionService = {
  getAll: async (): Promise<ScriptExecution[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    
    const { data, error } = await supabase
      .from('script_executions')
      .select('*')
      .eq('user_id', user.id)  // ← FILTRO
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  create: async (execution: Partial<ScriptExecution>): Promise<ScriptExecution> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    
    const { data, error } = await supabase
      .from('script_executions')
      .insert([{ ...execution, user_id: user.id }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
