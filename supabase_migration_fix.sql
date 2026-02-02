-- Script para adicionar a coluna faltante no Supabase
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS data_ativacao DATE DEFAULT CURRENT_DATE;

ALTER TABLE accounts 
ALTER COLUMN data_ativacao DROP NOT NULL;

COMMENT ON COLUMN accounts.data_ativacao IS 'Data de ativação da conta Google Ads';

-- Verificação
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'accounts' AND column_name = 'data_ativacao';