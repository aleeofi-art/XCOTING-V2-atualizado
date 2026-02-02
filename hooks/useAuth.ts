
import { useEffect } from 'react';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const isInitialized = useAppStore(state => state.isInitialized);
  const currentUser = useAppStore(state => state.currentUser);
  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  const initialize = useAppStore(state => state.initialize);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !isInitialized && isMounted) {
          await initialize();
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (!isMounted) return;
          if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
            // Só inicializa se não estiver carregando ou se o usuário mudou
            if (!isInitialized) {
              await initialize();
            }
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Erro no listener de auth:', error);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [initialize, setCurrentUser, isInitialized]); // Removido currentUser para quebrar o loop
  
  const userEmail = currentUser?.email?.toLowerCase() || '';
  const isOwner = userEmail === 'alexssandromarketing@gmail.com';
  
  const role = isOwner 
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
