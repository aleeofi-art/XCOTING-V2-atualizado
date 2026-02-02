import { supabase } from '../lib/supabase';
import { Alert } from '../types';

export const alertsService = {
  async getAlerts(): Promise<Alert[]> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  async acknowledgeAlert(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return false;
    }
  }
};