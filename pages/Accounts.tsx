import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Plus, Trash2, Search, 
  X as CloseIcon, ShieldAlert, TrendingUp
} from 'lucide-react';
import { useAppStore } from '../store';
import { useTenant } from '../hooks/useTenant';
import type { AdAccount } from '../types';

const Badge: React.FC<{ status: string }> = ({ status }) => {
  const colors = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    banned: 'bg-red-500/10 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${colors[status as keyof typeof colors] || colors.active}`}>
      {status}
    </span>
  );
};

const Accounts: React.FC = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  const profiles = useAppStore(state => state.profiles ?? []);
  const addProfile = useAppStore(state => state.addProfile);
  const updateProfile = useAppStore(state => state.updateProfile);
  const removeProfile = useAppStore(state => state.removeProfile);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [accountData, setAccountData] = useState<Partial<AdAccount>>({
    name: '',
    email: '',
    password: '',
    status: 'active',
    tier: '1',
    total_spend: 0,
    start_date: new Date().toISOString().split('T')[0]
  });

  // Loading state
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // No tenant error
  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-bold uppercase">Erro: Tenant não identificado</p>
          <p className="text-slate-400 text-sm">Entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  const handleCreateAccount = () => {
    setModalMode('create');
    setSelectedAccount(null);
    setAccountData({
      name: '',
      email: '',
      password: '',
      status: 'active',
      tier: '1',
      total_spend: 0,
      start_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: AdAccount) => {
    setModalMode('edit');
    setSelectedAccount(account);
    setAccountData(account);
    setIsModalOpen(true);
  };

  const handleSaveAccount = async () => {
    try {
      const finalData = {
        ...accountData,
        tenant_id: tenantId,
        updated_at: new Date().toISOString()
      };

      if (modalMode === 'create') {
        await addProfile(finalData as AdAccount);
      } else if (selectedAccount) {
        await updateProfile(selectedAccount.id, finalData);
      }

      setIsModalOpen(false);
      setAccountData({});
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await removeProfile(id);
    }
  };

  const filteredAccounts = profiles.filter(acc => 
    acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: profiles.length,
    active: profiles.filter(p => p.status === 'active').length,
    banned: profiles.filter(p => p.status === 'banned').length,
    totalSpend: profiles.reduce((sum, p) => sum + (p.total_spend || 0), 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white uppercase">CONTAS</h2>
          <p className="text-slate-500 mt-2">Gestão de contas Google Ads</p>
        </div>

        <button
          onClick={handleCreateAccount}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3"
        >
          <Plus size={20} /> NOVA CONTA
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
          <Users className="text-indigo-400 mb-4" size={24} />
          <p className="text-3xl font-black text-white">{stats.total}</p>
          <p className="text-xs text-slate-600 uppercase mt-2">Total</p>
        </div>

        <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
          <CheckCircle2 className="text-emerald-400 mb-4" size={24} />
          <p className="text-3xl font-black text-emerald-400">{stats.active}</p>
          <p className="text-xs text-slate-600 uppercase mt-2">Ativas</p>
        </div>

        <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
          <ShieldAlert className="text-red-400 mb-4" size={24} />
          <p className="text-3xl font-black text-red-400">{stats.banned}</p>
          <p className="text-xs text-slate-600 uppercase mt-2">Bloqueadas</p>
        </div>

        <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
          <TrendingUp className="text-indigo-400 mb-4" size={24} />
          <p className="text-2xl font-black text-white">R$ {stats.totalSpend.toFixed(2)}</p>
          <p className="text-xs text-slate-600 uppercase mt-2">Gasto</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
        <input
          type="text"
          placeholder="Buscar contas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-brand-surface/80 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white"
        />
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-black text-white">{account.name}</h4>
                <p className="text-xs text-slate-500">{account.email}</p>
              </div>
              <Badge status={account.status} />
            </div>

            <div className="space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Tier:</span>
                <span className="text-white font-black">T{account.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Gasto:</span>
                <span className="text-emerald-400 font-black">R$ {(account.total_spend || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditAccount(account)}
                className="flex-1 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl text-xs font-black uppercase"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="py-3 px-4 bg-red-600/10 text-red-400 rounded-xl"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-white/10 w-full max-w-2xl rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-white uppercase">
                {modalMode === 'create' ? 'Nova Conta' : 'Editar Conta'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500">
                <CloseIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={accountData.name || ''}
                onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white"
              />
              
              <input
                type="email"
                placeholder="Email"
                value={accountData.email || ''}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white"
              />

              <input
                type="password"
                placeholder="Senha"
                value={accountData.password || ''}
                onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white"
              />

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 text-white rounded-xl font-black uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAccount}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
