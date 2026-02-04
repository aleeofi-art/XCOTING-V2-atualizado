import { useEffect } from 'react';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  const initialize = useAppStore(state => state.initialize);

  useEffect(() => {
    let mounted = true;

    // 🔥 apenas UM ponto de inicialização
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        await initialize();
      } else {
        setCurrentUser(null);
      }
    };

    bootstrap();

    // 🔥 listener único (sem duplicar initialize)
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_, session) => {
        if (!mounted) return;

        if (session?.user) {
          await initialize();
        } else {
          setCurrentUser(null);
        }
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };

    // ❗ dependências mínimas → evita loop
  }, [initialize, setCurrentUser]);

  // ================================
  // ROLE LOGIC
  // ================================

  const userEmail = currentUser?.email?.toLowerCase() || '';

  const isOwner = userEmail === 'alexssandromarketing@gmail.com';

  const role: UserRole =
    isOwner
      ? 'acesso_total'
      : (currentUser?.role as UserRole || 'view');

  return {
    user: currentUser || null,
    role,

    isAdmin: role === 'acesso_total',
    isOperator: role === 'operador',
    isViewer: role === 'view',

    canEdit: role === 'acesso_total' || role === 'operador',
    canDelete: role === 'acesso_total',
    canManageTeam: role === 'acesso_total',

    canView: true,
    isAuthenticated: !!currentUser
  };
};
