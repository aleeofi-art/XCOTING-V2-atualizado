-- =====================================================
-- XCOTING - PROFILES (PRODUCTION READY)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    email TEXT NOT NULL,

    role TEXT DEFAULT 'view',
    tenant_id UUID NOT NULL,

    ads_power_profile_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------
-- ROLE CHECK
-- -----------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('acesso_total', 'operador', 'view', 'asset_group'));


-- =====================================================
-- 🔒 RLS (REAL SECURITY)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- SELECT → só próprio perfil
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);


-- UPDATE → só próprio
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);


-- INSERT → só seu próprio id
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);


-- DELETE → só seu próprio
CREATE POLICY "profiles_delete_own"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);


NOTIFY pgrst, 'reload schema';
