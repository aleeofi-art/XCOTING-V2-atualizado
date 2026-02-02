
-- =============================================================================
-- XCOTING - DATABASE SETUP & FIXES
-- =============================================================================

-- 1. GARANTIR QUE A TABELA PROFILES EXISTE E TEM AS COLUNAS CORRETAS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'view',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CORREÇÃO DA CONSTRAINT DE ROLE (ERRO 23514)
-- Removemos a restrição antiga e adicionamos a nova que inclui 'asset_group'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('acesso_total', 'operador', 'view', 'asset_group'));

-- 3. ADICIONAR COLUNAS PARA ASSET GROUPS (PERFIS ADS) NA TABELA PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ads_power_profile_id TEXT;

-- 4. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_profiles" ON public.profiles;
CREATE POLICY "public_read_profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "public_update_profiles" ON public.profiles;
CREATE POLICY "public_update_profiles" ON public.profiles FOR ALL TO authenticated USING (true);

-- 5. NOTIFICAÇÃO PARA O POSTGREST RECARREGAR O SCHEMA
NOTIFY pgrst, 'reload schema';
