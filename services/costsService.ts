
import { supabase } from '../lib/supabase';
import { OperationalCost } from '../types';
import { sanitizeUUID } from '../utils/dbSanitize';

export const costsService = {
  async getAll(): Promise<OperationalCost[]> {
    const { data, error } = await supabase.from('costs').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(c => ({
        id: c.id,
        date: c.date,
        type: c.type,
        accountId: c.account_id,
        accountName: c.account_name,
        category: c.category,
        amount: c.amount,
        description: c.description,
        userName: c.created_by_name || 'SYSTEM'
    }));
  },

  async create(cost: OperationalCost): Promise<OperationalCost> {
    const cleanId = sanitizeUUID(cost.id) || crypto.randomUUID();
    const cleanAccountId = sanitizeUUID(cost.accountId);

    const { error } = await supabase.from('costs').insert({
        id: cleanId,
        date: cost.date,
        type: cost.type,
        account_id: cleanAccountId,
        account_name: cost.accountName || null,
        category: cost.category,
        amount: cost.amount,
        description: cost.description || null,
        created_by_name: cost.userName || 'SYSTEM'
    });
    if (error) throw error;
    return { ...cost, id: cleanId };
  },

  async delete(id: string): Promise<void> {
    const cleanId = sanitizeUUID(id);
    if (!cleanId) return;
    
    const { error } = await supabase.from('costs').delete().eq('id', cleanId);
    if (error) throw error;
  },

  async deleteByAccountId(accountId: string): Promise<void> {
    const cleanId = sanitizeUUID(accountId);
    if (!cleanId) return;
    const { error } = await supabase.from('costs').delete().eq('account_id', cleanId);
    if (error) throw error;
  }
};
