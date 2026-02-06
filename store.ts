-- 1. Adicionar coluna user_id (se não existir)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE operational_costs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE script_executions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Habilitar RLS em TODAS as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_executions ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES - Policies
DROP POLICY IF EXISTS "Users view own profiles" ON profiles;
CREATE POLICY "Users view own profiles" ON profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own profiles" ON profiles;
CREATE POLICY "Users insert own profiles" ON profiles FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own profiles" ON profiles;
CREATE POLICY "Users update own profiles" ON profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own profiles" ON profiles;
CREATE POLICY "Users delete own profiles" ON profiles FOR DELETE USING (user_id = auth.uid());

-- 4. SCRIPTS - Policies
DROP POLICY IF EXISTS "Users view own scripts" ON scripts;
CREATE POLICY "Users view own scripts" ON scripts FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own scripts" ON scripts;
CREATE POLICY "Users insert own scripts" ON scripts FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own scripts" ON scripts;
CREATE POLICY "Users update own scripts" ON scripts FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own scripts" ON scripts;
CREATE POLICY "Users delete own scripts" ON scripts FOR DELETE USING (user_id = auth.uid());

-- 5. OPERATIONAL_COSTS - Policies
DROP POLICY IF EXISTS "Users view own costs" ON operational_costs;
CREATE POLICY "Users view own costs" ON operational_costs FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own costs" ON operational_costs;
CREATE POLICY "Users insert own costs" ON operational_costs FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own costs" ON operational_costs;
CREATE POLICY "Users update own costs" ON operational_costs FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own costs" ON operational_costs;
CREATE POLICY "Users delete own costs" ON operational_costs FOR DELETE USING (user_id = auth.uid());

-- 6. SCRIPT_EXECUTIONS - Policies
DROP POLICY IF EXISTS "Users view own executions" ON script_executions;
CREATE POLICY "Users view own executions" ON script_executions FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own executions" ON script_executions;
CREATE POLICY "Users insert own executions" ON script_executions FOR INSERT WITH CHECK (user_id = auth.uid());
