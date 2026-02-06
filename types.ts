export interface Profile {
  id: string
  user_id: string  // ← ADICIONAR
  name: string
  email: string
  // ... resto dos campos
}

export interface Script {
  id: string
  user_id: string  // ← ADICIONAR
  name: string
  // ... resto dos campos
}

export interface OperationalCost {
  id: string
  user_id: string  // ← ADICIONAR
  // ... resto dos campos
}

export interface ScriptExecution {
  id: string
  user_id: string  // ← ADICIONAR
  // ... resto dos campos
}
