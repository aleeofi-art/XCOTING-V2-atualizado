import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, Wallet, Lock, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, user, role } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Wallet, label: 'Custo Operac.', path: '/costs' },
    { icon: Users, label: 'Contas', path: '/accounts' },
    { icon: AlertTriangle, label: 'Suspensões', path: '/suspensions' },
    { icon: FileText, label: 'Track Script', path: '/scripts' },
    ...(isAdmin ? [{ icon: Settings, label: 'Configurações', path: '/settings' }] : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem('xcoting_auth');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-background-secondary border-r border-border flex flex-col z-50">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-primary">
          <Lock className="text-white w-4 h-4" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-none">XCoting</h1>
          <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Protect</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-button transition-all ${
                isActive 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                  : 'text-text-secondary hover:bg-background-tertiary hover:text-white border-l-2 border-transparent'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white uppercase">
            {user?.name?.substring(0, 2) || 'US'}
          </div>
          <div>
            <p className="text-sm font-medium text-white uppercase">{user?.name || 'Usuário'}</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
               {role === 'acesso_total' ? 'Admin' : role === 'operador' ? 'Operador' : 'Visualizador'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-text-secondary hover:text-danger w-full px-2 py-2 text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;