import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export function useTenant() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTenantId() {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user?.user_metadata?.tenant_id) {
          setTenantId(user.user_metadata.tenant_id);
        } else {
          console.error('Tenant ID não encontrado no user_metadata');
        }
      } catch (error) {
        console.error('Erro ao buscar tenant:', error);
      } finally {
        setLoading(false);
      }
    }

    getTenantId();
  }, []);

  return { tenantId, loading };
}
