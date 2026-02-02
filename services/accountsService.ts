
import { supabase } from '../lib/supabase';
import { AdAccount } from '../types';
import { sanitizeUUID, generateUUID } from '../utils/dbSanitize';

export const accountsService = {
  async getById(id: string): Promise<AdAccount | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', sanitizeUUID(id))
      .single();
    
    if (error) return null;
    
    return {
      id: data.id,
      profileId: data.profile_id,
      customerId: data.customer_id,
      email: data.email,
      status: data.status,
      tier: data.tier,
      proxy: data.proxy,
      hasProxy: data.has_proxy,
      domain: data.domain,
      cardLastFour: data.card_last_four, // Padronizado
      cardHolderName: data.card_holder_name, // Padronizado
      cardBank: data.card_bank, // Padronizado
      adsSpent: data.ads_spent,
      totalInvestment: data.total_investment,
      blockReasons: data.block_reasons,
      advertiserVerified: data.advertiser_verified,
      verificacaoG2: data.verificacao_g2,
      alteracaoPerfil: data.alteracao_perfil,
      alteracaoPagamento: data.alteracao_pagamento,
      razaoSocial: data.razao_social,
      tipoConta: data.tipo_conta,
      contestationArea: data.contestation_area,
      contestationCount: data.contestation_count,
      notes: data.notes,
      dataContestacao: data.data_contestacao,
      dataAtivacao: data.data_ativacao,
      dataRecuperacao: data.data_recuperacao,
      tipoScriptId: data.tipo_script_id,
      updatedAt: data.updated_at,
      lastActionBy: data.last_action_by || 'SYSTEM'
    };
  },

  async create(account: AdAccount): Promise<AdAccount> {
    const cleanId = sanitizeUUID(account.id) || generateUUID();
    const cleanProfileId = sanitizeUUID(account.profileId);

    if (!cleanProfileId) throw new Error("ID do Perfil pai é obrigatório.");

    const { error } = await supabase
      .from('accounts')
      .insert({
        id: cleanId,
        profile_id: cleanProfileId,
        customer_id: account.customerId,
        email: account.email || null,
        status: account.status,
        tier: account.tier,
        proxy: account.proxy || null,
        has_proxy: account.hasProxy,
        domain: account.domain || null,
        card_last_four: account.cardLastFour || null, // CORRIGIDO: de card_four para card_last_four
        card_holder_name: account.cardHolderName || null,
        card_bank: account.cardBank || null,
        ads_spent: account.adsSpent || 0,
        total_investment: account.totalInvestment || 0,
        // Fix: accessing blockReasons from AdAccount interface instead of block_reasons
        block_reasons: account.blockReasons || [],
        advertiser_verified: account.advertiserVerified,
        verificacao_g2: account.verificacaoG2 || false,
        alteracao_perfil: account.alteracaoPerfil || false,
        alteracao_pagamento: account.alteracaoPagamento || false,
        razao_social: account.razaoSocial || null,
        tipo_conta: account.tipoConta || 'farmada',
        contestation_area: account.contestationArea || null,
        contestation_count: account.contestationCount || 0,
        notes: account.notes || null,
        data_contestacao: account.dataContestacao || null,
        data_ativacao: account.dataAtivacao || null,
        data_recuperacao: account.dataRecuperacao || null,
        tipo_script_id: sanitizeUUID(account.tipoScriptId),
        last_action_by: account.lastActionBy || 'SYSTEM',
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { ...account, id: cleanId };
  },

  async update(accountId: string, updates: Partial<AdAccount>): Promise<void> {
    const cleanId = sanitizeUUID(accountId);
    if (!cleanId) throw new Error("ID de conta inválido.");

    const dbUpdates: any = {
      customer_id: updates.customerId,
      email: updates.email || null,
      status: updates.status,
      tier: updates.tier,
      proxy: updates.proxy || null,
      has_proxy: updates.hasProxy ?? !!updates.proxy,
      domain: updates.domain || null,
      card_last_four: updates.cardLastFour || null,
      card_holder_name: updates.cardHolderName || null,
      card_bank: updates.cardBank || null,
      ads_spent: updates.adsSpent || 0,
      total_investment: updates.totalInvestment || 0,
      block_reasons: updates.blockReasons || [],
      advertiser_verified: updates.advertiserVerified,
      verificacao_g2: updates.verificacaoG2,
      alteracao_perfil: updates.alteracaoPerfil,
      // Fix: corrected property name to use snake_case for DB column mapping
      alteracao_pagamento: updates.alteracaoPagamento,
      razao_social: updates.razaoSocial || null,
      tipo_conta: updates.tipoConta || 'farmada',
      notes: updates.notes || null,
      data_contestacao: updates.dataContestacao || null,
      data_ativacao: updates.dataAtivacao || null,
      data_recuperacao: updates.dataRecuperacao || null,
      tipo_script_id: sanitizeUUID(updates.tipoScriptId),
      last_action_by: updates.lastActionBy,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('accounts')
      .update(dbUpdates)
      .eq('id', cleanId);

    if (error) throw error;
  },

  async delete(accountId: string): Promise<void> {
    const cleanId = sanitizeUUID(accountId);
    if (!cleanId) return;
    const { error } = await supabase.from('accounts').delete().eq('id', cleanId);
    if (error) throw error;
  }
};
