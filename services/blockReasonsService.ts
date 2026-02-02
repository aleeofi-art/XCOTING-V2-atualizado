import { supabase } from '../lib/supabase';

export const blockReasonsService = {
  async getAllCategories() {
    const { data, error } = await supabase.from('block_reasons').select('*');
    if (error) throw error;
    return data;
  }
};