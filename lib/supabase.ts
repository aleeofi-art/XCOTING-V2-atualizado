
import { createClient } from '@supabase/supabase-js';

/**
 * Captura as variáveis de ambiente de forma exaustiva (Vite, Process, Window).
 * Se não encontrar, utiliza as chaves fornecidas pelo usuário como fallback final.
 */
const getEnvVar = (name: string, fallback: string): string => {
  const envs = [
    () => (typeof import.meta !== 'undefined' && (import.meta as any).env?.[name]),
    () => (typeof process !== 'undefined' && process.env?.[name]),
    () => (window as any)?.[name],
    () => (window as any)?._env_?.[name]
  ];

  for (const get of envs) {
    try {
      const val = get();
      if (val && typeof val === 'string' && !val.includes('placeholder')) {
        return val;
      }
    } catch (e) {}
  }
  return fallback;
};

// URL e Chave fornecidas pelo usuário para corrigir o erro de "Failed to fetch"
const SUPABASE_URL_DEFAULT = 'https://nwerqegklrseufvblvnm.supabase.co';
const SUPABASE_KEY_DEFAULT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZXJxZWdrbHJzZXVmdmJsdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjM5MTEsImV4cCI6MjA4NTI5OTkxMX0.E44T2ZehtLNSEWII_vDlvUzBR2LqrHpsysQCpV2IacI';

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', SUPABASE_URL_DEFAULT);
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', SUPABASE_KEY_DEFAULT);

console.log("[Supabase] Inicializando cliente com URL:", supabaseUrl);

/**
 * Inicializa o cliente com as chaves reais.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
