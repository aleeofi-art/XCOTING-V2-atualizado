import { supabase } from '../lib/supabase';
import { Suspension } from '../types';

export const suspensionsService = {
  async getSuspensions(): Promise<Suspension[]> {
    try {
      const { data, error } = await supabase
        .from('suspensions')
        .select('*')
        .order('detected_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching suspensions:', error);
      return [];
    }
  },

  async createSuspension(data: { 
    account_id: string, 
    suspension_type: string, 
    suspension_reason: string, 
    block_reason_id?: string 
  }): Promise<Suspension | null> {
    try {
      const { data: result, error } = await supabase
        .from('suspensions')
        .insert({
          ...data,
          status: 'pending',
          detected_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating suspension:', error);
      return null;
    }
  },

  async updateSuspension(id: string, data: { 
    status?: string, 
    resolved_at?: string, 
    recovery_cost?: number, 
    recovery_notes?: string 
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('suspensions')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating suspension:', error);
      return false;
    }
  },

  async getSuspensionsByAccount(accountId: string): Promise<Suspension[]> {
    try {
      const { data, error } = await supabase
        .from('suspensions')
        .select('*')
        .eq('account_id', accountId)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching suspensions by account:', error);
      return [];
    }
  }
};