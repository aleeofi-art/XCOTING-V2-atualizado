
import { create } from 'zustand';
import { 
  Profile, AdAccount, AccountStatus, Script, 
  OperationalCost, User, PlanId, SubscriptionPlan, 
  TeamMember, ScriptSection, ScriptExecution, UserRole 
} from './types';
import { profilesService } from './services/profilesService';
import { accountsService } from './services/accountsService';
import { scriptsService } from './services/scriptsService';
import { costsService } from './services/costsService';
import { executionService } from './services/executionService';
import { TemplateKey } from './services/scriptsTemplates';
import { supabase } from './lib/supabase';

export const PLANS: Record<PlanId, SubscriptionPlan> = {
  START_MENSAL: { id: 'START_MENSAL', name: 'STARTER', price: 47.90, maxContas: 25, maxUsuarios: 1, cycle: 'MENSAL', description: 'Iniciantes' },
  START_ANUAL: { id: 'START_ANUAL', name: 'STARTER', price: 397.90, maxContas: 25, maxUsuarios: 1, cycle: 'ANUAL', description: 'Iniciantes' },
  PRO_MENSAL: { id: 'PRO_MENSAL', name: 'PRO', price: 147.00, maxContas: 50, maxUsuarios: 3, cycle: 'MENSAL', description: 'Popular' },
  PRO_ANUAL: { id: 'PRO_ANUAL', name: 'PRO', price: 447.90, maxContas: 50, maxUsuarios: 3, cycle: 'ANUAL', description: 'Popular' },
  ELITE_MENSAL: { id: 'ELITE_MENSAL', name: 'MASTER', price: 197.90, maxContas: 200, maxUsuarios: 8, cycle: 'MENSAL', description: 'Elite' },
  ELITE_ANUAL: { id: 'ELITE_ANUAL', name: 'MASTER', price: 997.90, maxContas: 200, maxUsuarios: 8, cycle: 'ANUAL', description: 'Elite' }
};

interface AppState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  currentUser: User | null;
  currentPlanId: PlanId;
  profiles: Profile[];
  scripts: Script[];
  executions: ScriptExecution[];
  costs: OperationalCost[];
  teamMembers: TeamMember[];

  initialize: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  setPlan: (planId: PlanId) => void;
  addScript: (title: string, templateKey: TemplateKey, customContent?: string) => Promise<void>;
  updateScriptSections: (id: string, sections: ScriptSection[]) => Promise<void>;
  removeScript: (id: string) => Promise<void>;
  duplicateScript: (id: string) => Promise<void>;
  registerScriptExecution: (execution: Omit<ScriptExecution, 'id' | 'createdAt'>) => Promise<void>;
  updateExecutionResult: (executionId: string, result: 'APROVADO' | 'REJEITADO') => Promise<void>;
  addProfile: (profile: Profile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  updateProfileRole: (id: string, role: UserRole) => Promise<void>;
  addAccount: (perfilId: string, account: AdAccount) => Promise<void>;
  updateAccount: (perfilId: string, accountId: string, data: Partial<AdAccount>, profileName?: string) => Promise<void>;
  removeAccount: (perfilId: string, accountId: string) => Promise<void>;
  addCost: (cost: OperationalCost) => Promise<void>;
  removeCost: (id: string) => Promise<void>;
  addTeamMember: (member: TeamMember) => void; 
  removeTeamMember: (id: string) => void;
  canAddAccount: (q?: number) => boolean;
  canAddUser: () => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLoading: false,
  isInitialized: false,
  error: null,
  currentUser: null,
  currentPlanId: 'PRO_MENSAL',
  profiles: [],
  scripts: [],
  executions: [],
  costs: [],
  teamMembers: [],

  initialize: async () => {
    const state = get();
    if (state.isLoading) return;

    set({ isLoading: true, error: null });
    console.log("[Store] Iniciando sincronização...");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) { 
        console.warn("[Store] Nenhuma sessão ativa encontrada.");
        set({ isLoading: false, isInitialized: true, currentUser: null }); 
        return; 
      }

      const uid = session.user.id;
      const email = session.user.email || '';
      const isMaster = email.toLowerCase() === 'alexssandromarketing@gmail.com';

      // 1. Verificar Perfil do Usuário Logado
      let { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (!profileData) {
        console.log("[Store] Criando perfil inicial para o usuário...");
        const { data: newProfile, error: insError } = await supabase
          .from('profiles')
          .insert({ 
            id: uid, 
            name: session.user.user_metadata?.name || email.split('@')[0] || 'Novo Membro',
            email: email,
            role: isMaster ? 'acesso_total' : 'view' 
          })
          .select()
          .single();
        
        if (insError) throw insError;
        profileData = newProfile;
      }

      // 2. Carregar dados com resiliência (um não trava o outro)
      const results = await Promise.allSettled([
        profilesService.getAll(),
        scriptsService.getAll(),
        costsService.getAll(),
        executionService.getAll(),
        supabase.from('profiles').select('*').neq('role', 'asset_group')
      ]);

      const adProfilesData = results[0].status === 'fulfilled' ? results[0].value : [];
      const scriptsData = results[1].status === 'fulfilled' ? results[1].value : [];
      const costsData = results[2].status === 'fulfilled' ? results[2].value : [];
      const executionsData = results[3].status === 'fulfilled' ? results[3].value : [];
      const teamQuery = results[4].status === 'fulfilled' ? results[4].value : { data: [] };

      if (results[0].status === 'rejected') console.error("[Store] Erro ao carregar Perfis/Contas:", results[0].reason);

      const teamMembers: TeamMember[] = (teamQuery.data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role as any,
        active: true,
        createdAt: p.created_at || new Date().toISOString()
      }));

      set({ 
        currentUser: { 
          id: uid, 
          name: profileData.name, 
          email: email, 
          role: profileData.role as any 
        },
        profiles: adProfilesData || [], 
        scripts: scriptsData || [], 
        costs: costsData || [], 
        executions: executionsData || [],
        teamMembers: teamMembers,
        isLoading: false,
        isInitialized: true
      });

      console.log("[Store] Sincronização concluída com sucesso.");

    } catch (e: any) {
      console.error("[Store] Erro crítico na inicialização:", e);
      set({ isLoading: false, isInitialized: true, error: "Erro ao sincronizar dados do banco." });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user || null, isInitialized: !!user }),
  setPlan: (planId) => set({ currentPlanId: planId || 'PRO_MENSAL' }),

  addScript: async (title, templateKey, customContent) => {
    try {
      const newScript = await scriptsService.create(title, templateKey, customContent);
      if (newScript) set(state => ({ scripts: [newScript, ...(state.scripts || [])] }));
    } catch (e) { console.error(e); }
  },

  updateScriptSections: async (id, sections) => {
    try {
      await scriptsService.updateSections(id, sections || []);
      set(state => ({ scripts: (state.scripts || []).map(s => s.id === id ? { ...s, sections: sections || [] } : s) }));
    } catch (e) { console.error(e); }
  },

  removeScript: async (id) => {
    try {
      await scriptsService.delete(id);
      set(state => ({ scripts: (state.scripts || []).filter(s => s.id !== id) }));
    } catch (e) { console.error(e); }
  },

  duplicateScript: async (id) => {
    try {
      const s = (get().scripts || []).find(x => x.id === id);
      if (!s) return;
      const duplicated = await scriptsService.duplicate(s);
      set(state => ({ scripts: [duplicated, ...(state.scripts || [])] }));
    } catch (e) { console.error(e); }
  },

  registerScriptExecution: async (exec) => {
    try {
      const result = await executionService.register(exec);
      set(state => ({ 
        executions: [result, ...(state.executions || [])],
        scripts: (state.scripts || []).map(s => s.id === exec.scriptId ? { ...s, usageCount: (s.usageCount || 0) + 1, lastUsed: new Date().toISOString() } : s)
      }));
    } catch (e) { console.error(e); }
  },

  updateExecutionResult: async (id, result) => {
    try {
      await executionService.updateResult(id, result);
      set(state => ({ executions: (state.executions || []).map(e => e.id === id ? { ...e, resultado: result } : e) }));
    } catch (e) { console.error(e); }
  },

  addProfile: async (profile) => {
    try {
      const profileId = crypto.randomUUID();
      const userName = get().currentUser?.name || 'SISTEMA';
      const newProfile = await profilesService.create({ ...profile, id: profileId });
      
      for (const acc of (profile.accounts || [])) { 
        if (acc) {
           const accWithTracking = { ...acc, profileId: newProfile.id, lastActionBy: userName };
           await accountsService.create(accWithTracking); 
        }
      }
      set(state => ({ profiles: [{ ...newProfile, accounts: profile.accounts || [] }, ...(state.profiles || [])] }));
    } catch (e) { console.error(e); }
  },

  removeProfile: async (id) => {
    try {
      await profilesService.delete(id);
      set(state => ({ 
        profiles: (state.profiles || []).filter(p => p.id !== id),
        teamMembers: (state.teamMembers || []).filter(m => m.id !== id)
      }));
    } catch (e) { 
      console.error("[removeProfile] Erro:", e); 
      throw e;
    }
  },

  updateProfileRole: async (id, role) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        teamMembers: (state.teamMembers || []).map(m => m.id === id ? { ...m, role } : m),
        currentUser: state.currentUser?.id === id ? { ...state.currentUser, role } : state.currentUser
      }));
    } catch (e) {
      console.error("[updateProfileRole] Erro:", e);
      throw e;
    }
  },

  addAccount: async (pId, acc) => {
    try {
      if (!acc) return;
      const userName = get().currentUser?.name || 'SISTEMA';
      const accWithTracking = { ...acc, profileId: pId, lastActionBy: userName };
      await accountsService.create(accWithTracking);
      set(state => ({ profiles: (state.profiles || []).map(p => p.id === pId ? { ...p, accounts: [...(p.accounts || []), accWithTracking] } : p) }));
    } catch (e) { console.error(e); }
  },

  updateAccount: async (pId, aId, data, profileName) => {
    try {
      const userName = get().currentUser?.name || 'SISTEMA';
      const updatedData = { ...data, lastActionBy: userName };
      
      await accountsService.update(aId, updatedData);
      await costsService.deleteByAccountId(aId);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const accountSpecificCosts: OperationalCost[] = [];

      const costData = (data as any) || {};
      if (Number(costData.costGmail) > 0) {
        accountSpecificCosts.push({ id: crypto.randomUUID(), date: todayStr, type: 'CONTA', accountId: aId, accountName: profileName || 'N/A', category: 'Gmail', amount: Number(costData.costGmail), userName });
      }
      if (Number(costData.costDomain) > 0) {
        accountSpecificCosts.push({ id: crypto.randomUUID(), date: todayStr, type: 'CONTA', accountId: aId, accountName: profileName || 'N/A', category: 'Domínio', amount: Number(costData.costDomain), userName });
      }
      if (Number(costData.costProxy) > 0) {
        accountSpecificCosts.push({ id: crypto.randomUUID(), date: todayStr, type: 'CONTA', accountId: aId, accountName: profileName || 'N/A', category: 'Proxy', amount: Number(costData.costProxy), userName });
      }

      for (const cost of accountSpecificCosts) {
        await costsService.create(cost);
      }

      const [allCosts, allProfiles] = await Promise.all([
        costsService.getAll(),
        profilesService.getAll()
      ]);
      
      set({ costs: allCosts || [], profiles: allProfiles || [] });
    } catch (e) { console.error(e); }
  },

  removeAccount: async (pId, aId) => {
    try {
      await accountsService.delete(aId);
      await costsService.deleteByAccountId(aId);
      const [allCosts, allProfiles] = await Promise.all([
        costsService.getAll(),
        profilesService.getAll()
      ]);
      set({ costs: allCosts || [], profiles: allProfiles || [] });
    } catch (e) { console.error(e); }
  },

  addCost: async (cost) => {
    try {
      if (!cost) return;
      const userName = get().currentUser?.name || 'SISTEMA';
      const costWithTracking = { ...cost, userName };
      const result = await costsService.create(costWithTracking);
      set(state => ({ costs: [result, ...(state.costs || [])] }));
    } catch (e) { console.error(e); }
  },

  removeCost: async (id) => {
    try {
      await costsService.delete(id);
      set(state => ({ costs: (state.costs || []).filter(x => x.id !== id) }));
    } catch (e) { console.error(e); }
  },

  addTeamMember: (m) => set(state => ({ teamMembers: [...(state.teamMembers || []), m] })),
  removeTeamMember: (id) => {
    supabase.from('profiles').delete().eq('id', id).then(() => {
        set(state => ({ teamMembers: (state.teamMembers || []).filter(x => x.id !== id) }));
    });
  },
  
  canAddAccount: (q = 1) => {
    const state = get();
    const currentCount = (state?.profiles || []).reduce((acc, p) => acc + (p?.accounts?.length || 0), 0);
    return (currentCount + q) <= (PLANS[state.currentPlanId]?.maxContas || 25);
  },
  canAddUser: () => {
    const state = get();
    return ((state?.teamMembers?.length || 0) + 1) < (PLANS[state.currentPlanId]?.maxUsuarios || 1);
  }
}));

export const selectDashboardMetrics = (state: AppState) => {
  const profiles = state?.profiles || [];
  let activeIds = 0, totalContested = 0, recoveredIds = 0, contestedToday = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  
  profiles.forEach(p => (p?.accounts || []).forEach(a => {
    if (a?.status === 'ATIVA') activeIds++;
    if (a?.status === 'CONTESTADA' || a?.status === 'SUSPENSA' || a?.status === 'BLOQUEADA') { 
      totalContested++; 
      if (a?.updatedAt?.startsWith(todayStr)) contestedToday++; 
    }
    if (a?.status === 'RECUPERADA') recoveredIds++;
  }));

  const scriptsWithUsage = (state?.scripts || []).filter(s => (s?.usageCount || 0) > 0);
  let bestN = 'N/A', bestV = 0, worstN = 'N/A', worstV = 0, globalR = 0;

  if (scriptsWithUsage.length > 0) {
    const sorted = [...scriptsWithUsage].sort((a, b) => (b?.successRate || 0) - (a?.successRate || 0));
    bestN = sorted[0]?.title || 'N/A'; 
    bestV = sorted[0]?.successRate || 0;
    worstN = sorted[sorted.length - 1]?.title || 'N/A'; 
    worstV = sorted[sorted.length - 1]?.successRate || 0;
    globalR = Math.round(scriptsWithUsage.reduce((acc, s) => acc + (s?.successRate || 0), 0) / scriptsWithUsage.length);
  }

  return { activeIds, contestedToday, totalContested, recoveredIds, scripts: state?.scripts || [], bestScriptName: bestN, bestScriptVal: bestV, worstScriptName: worstN, worstScriptVal: worstV, globalApprovalRate: globalR };
};

export const selectCostTotals = (state: AppState) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const monthStr = now.toISOString().substring(0, 7);
  let today = 0, month = 0, accounts = 0, global = 0;
  
  (state?.costs || []).forEach(cost => {
    const amount = Number(cost?.amount) || 0;
    if (cost?.date === todayStr) today += amount;
    if (cost?.date?.startsWith(monthStr)) month += amount;
    if (cost?.type === 'CONTA') accounts += amount; 
    else if (cost?.type === 'GLOBAL') global += amount;
  });
  return { today, month, accounts, global };
};
