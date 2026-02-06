
export type UserRole = 'acesso_total' | 'operador' | 'view' | 'asset_group';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

// --- PLAN TYPES ---
export type PlanId = 
  | 'START_MENSAL' | 'START_ANUAL' 
  | 'PRO_MENSAL' | 'PRO_ANUAL' 
  | 'ELITE_MENSAL' | 'ELITE_ANUAL';

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  price: number;
  maxContas: number;
  maxUsuarios: number;
  cycle: 'MENSAL' | 'ANUAL';
  economiza?: string;
  description: string;
}

export type AccountStatus = 'ATIVA' | 'PAUSADA' | 'BLOQUEADA' | 'SUSPENSA' | 'RECUPERADA' | 'CONTESTADA' | 'REPROVADA';
export type Tier = 'T1' | 'T2' | 'T3' | 'T4';

export interface BlockReason {
  id: string;
  categoria: string;
  motivo: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  adsPowerProfileId?: string;
  accounts: AdAccount[];
  hasActiveAccounts: boolean;
  totalSpent: number;
  role?: UserRole;
}

export interface AdAccount {
  id: string;
  profileId: string;
  customerId: string;
  email: string;
  password?: string;
  status: AccountStatus;
  tier: Tier;
  proxy: string;
  hasProxy: boolean;
  domain: string;
  cardLastFour: string;
  cardHolderName: string;
  cardBank: string;
  costGmail?: number;
  costDomain?: number;
  costProxy?: number;
  adsSpent: number;
  totalInvestment: number;
  blockReasons: BlockReason[];
  advertiserVerified: boolean;
  verificacaoG2?: boolean;
  alteracaoPerfil?: boolean;
  alteracaoPagamento?: boolean;
  razaoSocial?: string;
  tipoConta?: 'comprada' | 'farmada';
  contestationArea: string;
  contestationCount: number;
  suspension_count?: number;
  last_suspension_at?: string;
  updatedAt: string;
  lastActionBy: string;
  notes?: string;
  dataContestacao?: string;
  dataAtivacao?: string;
  dataRecuperacao?: string;
  tipoScriptId?: string;
  blockDetails?: {
    alterationType?: string[];
    lastAlterationDate?: string;
    lastAlterationType?: string;
  };
}

export interface ScriptField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'boolean' | 'select';
  value: string;
  options?: string[];
  width?: 'full' | 'half';
  placeholder?: string;
}

export interface ScriptSection {
  id: string;
  title: string;
  fields: ScriptField[];
}

export interface Script {
  id: string;
  title: string;
  category: 'FRAUDE' | 'COMERCIAL' | 'VERIFICACAO' | 'MUDANCAS' | 'OUTROS';
  tipoScript: 'FRAUDE_SISTEMA' | 'PRATICAS_COMERCIAIS' | 'VERIFICACAO_PF' | 'VERIFICACAO_PJ' | 'PERSONALIZADO';
  description?: string;
  active?: boolean;
  sections?: ScriptSection[];
  content: string;
  successRate: number;
  usageCount: number;
  rejectionCount: number;
  lastUsed?: string;
  createdAt?: string;
}

export interface ScriptExecution {
  id: string;
  scriptId: string;
  accountId?: string;
  perfilId?: string;
  userId?: string; 
  operador: string;
  resultado: 'APROVADO' | 'REJEITADO' | 'PENDENTE';
  createdAt: string;
}

export interface OperationalCost {
  id: string;
  date: string;
  type: 'GLOBAL' | 'CONTA';
  accountId?: string;
  accountName?: string;
  category: string;
  amount: number;
  description?: string;
  userName?: string;
}

export interface ActivityLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user?: string;
}

export interface Contestation {
  id: string;
  accountId: string;
  status: string;
  createdAt: string;
  description?: string;
}

export interface Suspension {
  id: string;
  account_id: string;
  suspension_type: string;
  suspension_reason: string;
  block_reason_id?: string;
  detected_at: string;
  resolved_at?: string;
  recovery_script_id?: string;
  recovery_cost?: number;
  recovery_notes?: string;
  status: string;
}

export interface Event {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  severity: string;
  created_at: string;
}

export interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  acknowledged: boolean;
  created_at: string;
}
