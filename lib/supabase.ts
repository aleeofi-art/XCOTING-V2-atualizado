import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Supabase ENV não configurado. Crie um .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
VITE_SUPABASE_URL=https://nwerqegklrseufvblvnm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZXJxZWdrbHJzZXVmdmJsdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjM5MTEsImV4cCI6MjA4NTI5OTkxMX0.E44T2ZehtLNSEWII_vDlvUzBR2LqrHpsysQCpV2IacI
