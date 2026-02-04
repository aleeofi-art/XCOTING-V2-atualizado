import type {
  Profile,
  Script,
  Contestation,
  ActivityLog,
  OperationalCost
} from './types';


// =====================================================
// Estados iniciais vazios (imutáveis)
// Forçam uso de LocalStorage / Supabase como fonte real
// =====================================================

export const INITIAL_PROFILES: readonly Profile[] = [];
export const INITIAL_SCRIPTS: readonly Script[] = [];
export const INITIAL_ACTIVITY: readonly ActivityLog[] = [];
export const INITIAL_CONTESTATIONS: readonly Contestation[] = [];
export const INITIAL_COSTS: readonly OperationalCost[] = [];
