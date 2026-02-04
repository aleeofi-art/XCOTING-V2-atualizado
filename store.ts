import { create } from 'zustand'
import { supabase } from './lib/supabase'
import {
  Profile,
  Script,
  OperationalCost,
  ScriptExecution,
  User,
  PlanId,
  SubscriptionPlan,
  TeamMember,
  ScriptSection,
  UserRole
} from './types'

import { profilesService } from './services/profilesService'
import { scriptsService } from './services/scriptsService'
import { costsService } from './services/costsService'
import { executionService } from './services/executionService'

/* ======================================================
PLANS
====================================================== */

export const PLANS: Record<PlanId, SubscriptionPlan> = {
  START_MENSAL: { id: 'START_MENSAL', name: 'STARTER', price: 47.9, maxContas: 25, maxUsuarios: 1, cycle: 'MENSAL', description: 'Iniciantes' },
  PRO_MENSAL: { id: 'PRO_MENSAL', name: 'PRO', price: 147, maxContas: 50, maxUsuarios: 3, cycle: 'MENSAL', description: 'Popular' },
  ELITE_MENSAL: { id: 'ELITE_MENSAL', name: 'MASTER', price: 197.9, maxContas: 200, maxUsuarios: 8, cycle: 'MENSAL', description: 'Elite' }
}

/* ======================================================
STATE
====================================================== */

interface AppState {
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  currentUser: User | null
  currentPlanId: PlanId

  profiles: Profile[]
  scripts: Script[]
  executions: ScriptExecution[]
  costs: OperationalCost[]
  teamMembers: TeamMember[]

  initialize: () => Promise<void>
  setCurrentUser: (user: User | null) => void
}

/* ======================================================
STORE
====================================================== */

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

  /* ======================================================
  INIT
  ====================================================== */

  initialize: async () => {
    if (get().isLoading) return

    set({ isLoading: true, error: null })

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        set({ isLoading: false, isInitialized: true })
        return
      }

      const uid = session.user.id
      const email = session.user.email || ''

      /* -------------------------
         PROFILE
      ------------------------- */

      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle()

      if (!profile) {
        const { data } = await supabase
          .from('profiles')
          .insert({
            id: uid,
            name: email.split('@')[0],
            email,
            role: 'acesso_total'
          })
          .select()
          .single()

        profile = data
      }

      /* -------------------------
         LOAD DATA SAFE
      ------------------------- */

      const [profiles, scripts, costs, executions] = await Promise.all([
        profilesService.getAll().catch(() => []),
        scriptsService.getAll().catch(() => []),
        costsService.getAll().catch(() => []),
        executionService.getAll().catch(() => [])
      ])

      set({
        currentUser: {
          id: uid,
          name: profile?.name || 'Usuário',
          email,
          role: profile?.role as any
        },
        profiles,
        scripts,
        costs,
        executions,
        isLoading: false,
        isInitialized: true
      })

      console.log('Store sincronizado ✅')
    } catch (e) {
      console.error(e)
      set({
        error: 'Erro ao sincronizar banco',
        isLoading: false,
        isInitialized: true
      })
    }
  },

  setCurrentUser: (user) => set({ currentUser: user })
}))
