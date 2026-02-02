
-- =============================================================================
-- XCOTING - MASTER SCHEMA FIX
-- =============================================================================

DO $$ 
BEGIN 
    -- 1. Garantir card_last_four
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts' AND column_name='card_last_four') THEN
        ALTER TABLE accounts ADD COLUMN card_last_four TEXT;
    END IF;

    -- 2. Garantir card_holder_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts' AND column_name='card_holder_name') THEN
        ALTER TABLE accounts ADD COLUMN card_holder_name TEXT;
    END IF;

    -- 3. Garantir card_bank
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts' AND column_name='card_bank') THEN
        ALTER TABLE accounts ADD COLUMN card_bank TEXT;
    END IF;

    -- 4. Remover colunas com nomes errados (Opcional, mas recomendado para limpeza)
    -- ALTER TABLE accounts DROP COLUMN IF EXISTS card_four;
    -- ALTER TABLE accounts DROP COLUMN IF EXISTS final_4_digitos;

END $$;

-- Forçar atualização do cache do Supabase
NOTIFY pgrst, 'reload schema';
