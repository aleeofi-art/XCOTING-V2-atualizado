-- =====================================================
-- XCOTING - PRODUCTION SAFE SETUP
-- =====================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'view',
    tenant_id UUID,
    ads_power_profile_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ROLE CHECK
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
CHECK (role IN ('acesso_total', 'operador', 'view', 'asset_group'));


-- =====================================================
-- RLS (SEGURANÇA REAL)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- SELECT → só o próprio usuário
CREATE POLICY "users_can_read_own_profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);


-- UPDATE → só o próprio usuário
CREATE POLICY "users_can_update_own_profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);


-- INSERT → só inserir seu próprio id
CREATE POLICY "users_can_insert_own_profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);


-- DELETE → só deletar o próprio
CREATE POLICY "users_can_delete_own_profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);


NOTIFY pgrst, 'reload schema';
-- admin pode ver todos
CREATE POLICY "admin_can_read_all_profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'acesso_total'
  )
);
