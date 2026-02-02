import { supabase } from '../lib/supabase';
import { ScriptExecution } from '../types';
import { sanitizeUUID } from '../utils/dbSanitize';

export const executionService = {
  async getAll(): Promise<ScriptExecution[]> {
    const { data, error } = await supabase.from('script_executions').select('*');
    if (error) throw error;
    return (data || []).map(e => ({
        id: e.id,
        scriptId: e.script_id,
        accountId: e.account_id,
        perfilId: e.perfil_id,
        userId: e.user_id,
        operador: e.operador, // Nome correto da coluna no banco
        resultado: e.resultado,
        createdAt: e.created_at
    }));
  },

  async register(execution: Omit<ScriptExecution, 'id' | 'createdAt'>): Promise<ScriptExecution> {
    const newExec = {
        id: crypto.randomUUID(),
        script_id: sanitizeUUID(execution.scriptId),
        account_id: sanitizeUUID(execution.accountId),
        user_id: sanitizeUUID(execution.userId),
        operador: execution.operador, 
        resultado: execution.resultado,
        created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('script_executions').insert(newExec);
    if (error) throw error;

    const scriptId = sanitizeUUID(execution.scriptId);
    if (scriptId) {
      await supabase.rpc('increment_script_usage', { script_id: scriptId });
    }

    return {
        ...execution,
        id: newExec.id,
        createdAt: newExec.created_at
    };
  },

  async updateResult(executionId: string, result: 'APROVADO' | 'REJEITADO'): Promise<void> {
    const { error } = await supabase
      .from('script_executions')
      .update({ resultado: result })
      .eq('id', sanitizeUUID(executionId));
    
    if (error) throw error;
  }
};