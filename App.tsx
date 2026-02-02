
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import React, { useEffect } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  if (isLoginPage || isRegisterPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background-primary text-text-primary font-sans antialiased selection:bg-primary selection:text-white">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8 overflow-y-auto min-h-screen min-w-0">
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => !!state.currentUser);
  const isLoading = useAppStore(state => state.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  useAuth();
  
  const initialize = useAppStore(state => state.initialize);
  const isInitialized = useAppStore(state => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
          <Route path="/costs" element={<ProtectedRoute><Costs /></ProtectedRoute>} />
          <Route path="/suspensions" element={<ProtectedRoute><Suspensions /></ProtectedRoute>} />
          <Route path="/scripts" element={<ProtectedRoute><Scripts /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
