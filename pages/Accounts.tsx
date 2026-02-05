import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, CheckCircle2, Plus, Trash2, Mail, 
  Lock, User, UserUp, Copy, Check, AlertCircle, X as CloseIcon, 
  Search, AlertTriangle, ShieldCheck, Globe, Database, Download, 
  RefreshCw, ShieldAlert, Loader2, Clock, Calendar, TrendingUp,
  Link as LinkIcon
} from 'lucide-react';
import { Card, Button, Input, Modal, Tabs, Badge } from '../components/ui';
import { AdAccount, PlantId } from '../types';
import { useAppStore } from '../store';
import { useTenant } from '../hooks/useTenant';

const Accounts: React.FC = () => {
  const { tenantId, loading: tenantLoading } = useTenant();
  
  const { 
    currentPlanId, 
    setCurrentPlan,
    teamMembers, 
    canManageTeam, 
    removeProfile, 
    updateProfileRole, 
    profiles, 
    costs, 
    scripts 
  } = useAppStore(state => ({
    currentPlanId: state.currentPlanId,
    setCurrentPlan: state.setPlan,
    teamMembers: state.teamMembers ?? [],
    canManageTeam: state.canManageTeam,
    removeProfile: state.removeProfile,
    updateProfileRole: state.updateProfileRole,
    profiles: state.profiles ?? [],
    costs: state.costs ?? [],
    scripts: state.scripts ?? []
  }));

  const [searchEmail, setSearchEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'contas' | 'equipe'>('contas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  
  const [accountData, setAccountData] = useState<Partial<AdAccount>>({
    name: '',
    email: '',
    password: '',
    status: 'active',
    tier: '1',
    proxy: '',
    domain: '',
    cnpj: '',
    card_last4: '',
    bank_name: '',
    card_holder: '',
    origin: 'purchased',
    total_spend: 0,
    cycle_spent: 0,
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
    tags: []
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Loading state
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto" />
          <p className="text-white font-bold uppercase">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-red-500 font-bold uppercase">Erro: Tenant não identificado</p>
          <p className="text-slate-400 text-sm">Entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateAccount = () => {
    setModalMode('create');
    setSelectedAccount(null);
    setAccountData({
      name: '',
      email: '',
      password: '',
      status: 'active',
      tier: '1',
      proxy: '',
      domain: '',
      cnpj: '',
      card_last4: '',
      bank_name: '',
      card_holder: '',
      origin: 'purchased',
      total_spend: 0,
      cycle_spent: 0,
      start_date: new Date().toISOString().split('T')[0],
      notes: '',
      tags: [],
      tenant_id: tenantId // 🆕 INCLUIR TENANT_ID
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
        tenant_id: tenantId, // 🆕 SEMPRE INCLUIR TENANT_ID
        updated_at: new Date().toISOString()
      };

      if (modalMode === 'create') {
        // Criar nova conta
        await useAppStore.getState().addProfile(finalData as AdAccount);
      } else if (selectedAccount) {
        // Atualizar conta existente
        await useAppStore.getState().updateProfile(selectedAccount.id, finalData);
      }

      setIsModalOpen(false);
      setAccountData({});
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await removeProfile(id);
    }
  };

  const filteredAccounts = profiles.filter(acc => 
    acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeam = teamMembers.filter(member =>
    member.email?.toLowerCase().includes(searchEmail.toLowerCase()) ||
    member.name?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const stats = {
    total: profiles.length,
    active: profiles.filter(p => p.status === 'active').length,
    banned: profiles.filter(p => p.status === 'banned').length,
    totalSpend: profiles.reduce((sum, p) => sum + (p.total_spend || 0), 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">GESTÃO DE CONTAS</h2>
          <p className="text-slate-500 font-medium italic mt-2">Controle total das suas contas Google Ads</p>
        </div>
        
        <Button 
          onClick={handleCreateAccount}
          icon={Plus}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-xl"
        >
          NOVA CONTA
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-indigo-400" size={24} />
            <span className="text-xs font-black text-slate-600 uppercase">Total</span>
          </div>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>

        <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle2 className="text-emerald-400" size={24} />
            <span className="text-xs font-black text-slate-600 uppercase">Ativas</span>
          </div>
          <p className="text-3xl font-black text-emerald-400">{stats.active}</p>
        </div>

        <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <ShieldAlert className="text-red-400" size={24} />
            <span className="text-xs font-black text-slate-600 uppercase">Bloqueadas</span>
          </div>
          <p className="text-3xl font-black text-red-400">{stats.banned}</p>
        </div>

        <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-indigo-400" size={24} />
            <span className="text-xs font-black text-slate-600 uppercase">Gasto Total</span>
          </div>
          <p className="text-2xl font-black text-white">R$ {stats.totalSpend.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-brand-surface/40 backdrop-blur-md border border-white/5 rounded-3xl p-2 flex gap-2 w-fit">
        <button
          onClick={() => setActiveTab('contas')}
          className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'contas'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Contas Google Ads
        </button>
        <button
          onClick={() => setActiveTab('equipe')}
          className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'equipe'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Equipe
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
        <input
          type="text"
          placeholder={activeTab === 'contas' ? 'Buscar contas...' : 'Buscar membros...'}
          value={activeTab === 'contas' ? searchTerm : searchEmail}
          onChange={(e) => activeTab === 'contas' ? setSearchTerm(e.target.value) : setSearchEmail(e.target.value)}
          className="w-full bg-brand-surface/80 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/40 transition-all placeholder:text-slate-700 font-bold"
        />
      </div>

      {/* Content */}
      {activeTab === 'contas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-slate-500 font-bold uppercase text-xs">
              Nenhuma conta encontrada
            </div>
          ) : (
            filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-brand-surface border border-white/5 p-6 rounded-3xl hover:border-indigo-600/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-white mb-1">{account.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{account.email}</p>
                  </div>
                  <Badge status={account.status} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-bold uppercase">Tier:</span>
                    <span className="text-white font-black">T{account.tier}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-bold uppercase">Gasto:</span>
                    <span className="text-emerald-400 font-black">R$ {(account.total_spend || 0).toFixed(2)}</span>
                  </div>
                  {account.proxy && (
                    <div className="flex items-center gap-2 text-xs">
                      <Globe size={12} className="text-slate-600" />
                      <span className="text-slate-400 font-mono truncate">{account.proxy}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="flex-1 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-black uppercase transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="py-3 px-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeam.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-bold uppercase text-xs">
              Nenhum membro encontrado
            </div>
          ) : (
            filteredTeam.map((member) => (
              <div
                key={member.id}
                className="bg-brand-surface border border-white/5 p-6 rounded-3xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center">
                    <User className="text-indigo-400" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-black">{member.name || member.email}</h4>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-indigo-400 uppercase">{member.role}</span>
                  {canManageTeam && (
                    <button
                      onClick={() => removeProfile(member.id)}
                      className="text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-brand-surface border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-white uppercase">
                {modalMode === 'create' ? 'Nova Conta' : 'Editar Conta'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <CloseIcon size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Nome do Perfil</label>
                  <input
                    type="text"
                    value={accountData.name || ''}
                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                    className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white font-bold"
                    placeholder="Minha Conta Ads"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Email</label>
                  <input
                    type="email"
                    value={accountData.email || ''}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white font-bold"
                    placeholder="email@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Senha</label>
                <input
                  type="password"
                  value={accountData.password || ''}
                  onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                  className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white font-bold"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Proxy</label>
                  <input
                    type="text"
                    value={accountData.proxy || ''}
                    onChange={(e) => setAccountData({ ...accountData, proxy: e.target.value })}
                    className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white font-mono"
                    placeholder="127.0.0.1:8080"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Domínio</label>
                  <input
                    type="text"
                    value={accountData.domain || ''}
                    onChange={(e) => setAccountData({ ...accountData, domain: e.target.value })}
                    className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white font-mono"
                    placeholder="meusite.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Observações</label>
                <textarea
                  value={accountData.notes || ''}
                  onChange={(e) => setAccountData({ ...accountData, notes: e.target.value })}
                  className="w-full bg-brand-background border border-white/5 rounded-xl px-4 py-3 text-white h-24"
                  placeholder="Anotações sobre esta conta..."
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAccount}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs transition-all"
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
