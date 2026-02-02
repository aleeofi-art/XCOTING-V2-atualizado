
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { sanitizeUUID, generateUUID } from '../utils/dbSanitize';

/**
 * Serviço de Perfis (Asset Groups).
 * Utiliza a tabela 'profiles' com o discriminador role='asset_group'.
 */
export const profilesService = {
  async getAll(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, accounts(*)')
        .eq('role', 'asset_group');
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        adsPowerProfileId: p.ads_power_profile_id,
        accounts: (p.accounts || []).map((a: any) => ({
          id: a.id,
          profileId: a.profile_id,
          customerId: a.customer_id,
          email: a.email,
          status: a.status,
          tier: a.tier,
          tipoConta: a.tipo_conta,
          proxy: a.proxy,
          domain: a.domain,
          razaoSocial: a.razao_social,
          cardBank: a.card_bank, // Corrigido de banco_emissor
          cardHolderName: a.card_holder_name, // Corrigido de nome_titular
          cardLastFour: a.card_last_four, // Corrigido de final_4_digitos
          costGmail: a.custo_gmail,
          costDomain: a.custo_dominio,
          costProxy: a.custo_proxy,
          adsSpent: a.gasto_ads,
          totalInvestment: a.total_investment,
          blockReasons: a.block_reasons || [],
          advertiserVerified: a.advertiser_verified,
          verificacaoG2: a.verificacao_g2,
          alteracaoPerfil: a.alteracao_perfil,
          alteracaoPagamento: a.alteracao_pagamento,
          dataContestacao: a.data_contestacao,
          dataAtivacao: a.data_ativacao,
          dataRecuperacao: a.data_recuperacao,
          tipoScriptId: a.tipo_script_id,
          notes: a.notes,
          updatedAt: a.updated_at
        })),
        hasActiveAccounts: (p.accounts || []).some((a: any) => a.status === 'ATIVA'),
        totalSpent: (p.accounts || []).reduce((acc: number, curr: any) => acc + (curr.total_investment || 0), 0)
      }));
    } catch (e) {
      console.error("[ProfilesService] Erro ao buscar:", e);
      return [];
    }
  },

  async create(profile: Partial<Profile>): Promise<Profile> {
    const cleanId = sanitizeUUID(profile.id) || generateUUID();
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: cleanId,
        name: profile.name || 'Novo Perfil',
        ads_power_profile_id: profile.adsPowerProfileId || null,
        role: 'asset_group'
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error("[ProfilesService] Erro no Upsert:", error);
      throw error;
    }
    
    return { ...data, accounts: [], hasActiveAccounts: false, totalSpent: 0 };
  },

  async update(id: string, updates: Partial<Profile>): Promise<void> {
    const cleanId = sanitizeUUID(id);
    if (!cleanId) throw new Error("ID inválido");

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        ads_power_profile_id: updates.adsPowerProfileId || null
      })
      .eq('id', cleanId);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const cleanId = sanitizeUUID(id);
    if (!cleanId) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', cleanId);
    if (error) throw error;
  }
};
