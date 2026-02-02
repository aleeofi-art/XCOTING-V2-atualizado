import { supabase } from '../lib/supabase';
import { Event } from '../types';

export const eventsService = {
  async getRecentEvents(limit: number = 20): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent events:', error);
      return [];
    }
  }
};