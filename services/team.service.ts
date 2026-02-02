
import { supabase } from '../lib/supabase';

export interface TeamMemberDB {
  id: string;
  user_id: string;
  role: 'admin' | 'operador';
  name: string;
  email: string;
  created_at: string;
}

export const teamService = {
  async getCurrentMember(userId: string): Promise<TeamMemberDB | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("[TeamService] Erro ao buscar membro:", error);
      return null;
    }
    return data;
  },

  async createMember(member: Partial<TeamMemberDB>): Promise<TeamMemberDB> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        user_id: member.user_id,
        email: member.email,
        name: member.name || member.email?.split('@')[0],
        role: member.role || 'operador'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listMembers(): Promise<TeamMemberDB[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateRole(userId: string, role: 'admin' | 'operador'): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async deleteMember(userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};
