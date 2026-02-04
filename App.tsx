import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Scripts from './pages/Scripts';
import Costs from './pages/Costs';
import Suspensions from './pages/Suspensions';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

import { useAppStore } from './store';
import { useAuth } from './hooks/useAuth';


// ===============================
// Layout (apenas rotas logadas)
// ===============================
const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background-primary text-text-primary font-sans antialiased">
      <Sidebar />

      <main className="flex-1 ml-[260px] p-8 overflow-y-auto min-h-screen min-w-0">
        <Outlet />
      </main>
    </div>
  );
};


// ===============================
// Proteção de rota
// ===============================
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAppStore(s => !!s.currentUser);
  const isLoading = useAppStore(s => s.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};


// ===============================
// App principal
// ===============================
const App: React.FC = () => {
  const initialize = useAppStore(s => s.initialize);
  const isInitialized = useAppStore(s => s.isInitialized);
  const auth = useAuth();

  useEffect(() => {
    auth();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return (
    <HashRouter>
      <Routes>
        {/* públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/costs" element={<Costs />} />
          <Route path="/suspensions" element={<Suspensions />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
