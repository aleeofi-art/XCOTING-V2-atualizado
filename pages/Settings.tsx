
import React, { useState } from 'react';
import { 
  Users, CreditCard, CheckCircle, Plus, Trash2, Mail, 
  ShieldAlert, UserPlus, Copy, Check, AlertCircle, 
  Search, AlertTriangle, X as CloseIcon, Database, Download, 
  RefreshCw, HardDrive, ShieldCheck
} from 'lucide-react';
import { Card, Button, Input, Modal, Tabs, Badge } from '../components/ui';
import { UserRole, PlanId } from '../types';
import { useAppStore, PLANS } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const { currentPlanId, setPlan, teamMembers, canAddUser, removeProfile, updateProfileRole, profiles, costs, scripts } = useAppStore(useShallow(state => ({
    currentPlanId: state.currentPlanId, 
    setPlan: state.setPlan, 
    teamMembers: state.teamMembers ?? [], 
    canAddUser: state.canAddUser,
    removeProfile: state.removeProfile,
    updateProfileRole: state.updateProfileRole,
    profiles: state.profiles,
    costs: state.costs,
    scripts: state.scripts
  })));

  const { isAdmin, canManageTeam, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('plans');
  const [billingCycle, setBillingCycle] = useState<'MENSAL' | 'ANUAL'>('MENSAL');
  
  // Modais
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{id: string, name: string} | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('view');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      profiles,
      costs,
      scripts,
      version: '2.0.0-backup'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xcoting-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePromoteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddUser()) { 
      setError("Limite de usuários do plano atingido."); 
      return; 
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: userToPromote, error: searchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail.trim().toLowerCase())
        .maybeSingle();

      if (searchError) throw searchError;
      if (!userToPromote) {
        throw new Error('Usuário não encontrado. Peça para o membro se cadastrar no sistema primeiro.');
      }

      await updateProfileRole(userToPromote.id, selectedRole);

      setSuccess(`Acesso concedido para ${searchEmail} como ${selectedRole.toUpperCase()}!`);
      setSearchEmail('');
    } catch (err: any) { 
      setError(err.message || 'Erro ao processar acesso.');
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateProfileRole(userId, newRole);
    } catch (err: any) {
      alert(`Erro ao mudar cargo: ${err.message}`);
    }
  };

  const triggerDeleteMember = (id: string, name: string) => {
    setMemberToDelete({ id, name });
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToDelete) return;
    setIsProcessing(true);
    try {
      await removeProfile(memberToDelete.id);
      setIsConfirmDeleteOpen(false);
      setMemberToDelete(null);
    } catch (err: any) { 
      alert(`Erro ao excluir: ${err.message}`); 
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 'plans', label: 'PLANOS' }, 
    ...(canManageTeam ? [{ id: 'team', label: 'EQUIPE' }] : []),
    { id: 'system', label: 'SISTEMA' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight italic">CONFIGURAÇÕES</h2>
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />

      {activeTab === 'plans' && (
        <div className="space-y-8">
          <div className="flex justify-center mb-10">
            <div className="bg-background-secondary p-1 rounded-button border border-border flex items-center">
              <button 
                onClick={() => setBillingCycle('MENSAL')}
                className={`px-6 py-2 text-xs font-bold rounded-button transition-all ${billingCycle === 'MENSAL' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
              >
                MENSAL
              </button>
              <button 
                onClick={() => setBillingCycle('ANUAL')}
                className={`px-6 py-2 text-xs font-bold rounded-button transition-all flex items-center gap-2 ${billingCycle === 'ANUAL' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
              >
                ANUAL <Badge status="ATIVA">ECONOMIZE</Badge>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['START', 'PRO', 'ELITE'].map((baseId) => {
              const fullId = `${baseId}_${billingCycle}` as PlanId;
              const planData = PLANS[fullId];
              const isCurrent = currentPlanId === fullId;
              return (
                <Card key={baseId} className={`relative flex flex-col p-8 border-2 transition-all ${isCurrent ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border/40 hover:border-border'}`}>
                  {isCurrent && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-glow-primary">
                      SEU PLANO
                    </div>
                  )}
                  <h3 className="text-2xl font-black text-white text-center mb-1 uppercase italic tracking-tighter">{planData.name}</h3>
                  <p className="text-center text-[10px] text-text-tertiary mb-6 uppercase font-bold tracking-widest">{planData.description}</p>
                  
                  <div className="text-center mb-8 border-b border-border pb-6">
                    <span className="text-4xl font-black text-white">R$ {planData.price.toFixed(2).replace('.', ',')}</span>
                    <p className="text-[10px] text-text-tertiary font-bold mt-1">POR {billingCycle === 'ANUAL' ? 'ANO' : 'MÊS'}</p>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                      <div className="flex items-center gap-3 text-sm text-text-primary font-medium">
                        <CheckCircle size={18} className="text-success" /> {planData.maxContas} Contas Google Ads
                      </div>
                      <div className="flex items-center gap-3 text-sm text-text-primary font-medium">
                        <CheckCircle size={18} className="text-success" /> {planData.maxUsuarios} Membros na Equipe
                      </div>
                      <div className="flex items-center gap-3 text-sm text-text-primary font-medium">
                        <CheckCircle size={18} className="text-success" /> Track Scripts Ilimitados
                      </div>
                      <div className="flex items-center gap-3 text-sm text-text-primary font-medium">
                        <CheckCircle size={18} className="text-success" /> Suporte Prioritário
                      </div>
                  </div>

                  <Button 
                    variant={isCurrent ? 'outline' : 'primary'} 
                    className="w-full py-4 text-[10px] font-black uppercase italic tracking-widest" 
                    disabled={isCurrent || !isAdmin} 
                    onClick={() => isAdmin && setPlan(fullId)}
                  >
                      {isCurrent ? 'ESTE É SEU PLANO ATUAL' : 'FAZER UPGRADE AGORA'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'team' && canManageTeam && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-background-secondary p-6 rounded-card border border-border">
            <div>
              <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">MEMBROS DA EQUIPE</h3>
              <p className="text-xs text-text-secondary italic">Gerencie acessos e permissões do seu time.</p>
            </div>
            <Button icon={UserPlus} onClick={() => setIsMemberModalOpen(true)} className="shadow-glow-primary">VINCULAR MEMBRO</Button>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background-tertiary text-[10px] text-text-secondary uppercase font-bold border-b border-border">
                  <tr>
                    <th className="py-4 px-6">Membro</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Cargo</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-background-tertiary/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase italic">{member.name}</p>
                            <p className="text-[10px] text-text-tertiary">Entrou em {new Date(member.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-text-secondary font-mono">{member.email}</td>
                      <td className="py-4 px-6">
                        <select 
                          disabled={member.id === currentUser?.id || !isAdmin}
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value as UserRole)}
                          className="bg-background-primary border border-border-input rounded px-2 py-1.5 text-[10px] font-bold text-white uppercase outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        >
                          <option value="acesso_total">ACESSO TOTAL</option>
                          <option value="operador">OPERADOR</option>
                          <option value="view">VISUALIZADOR</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge status={member.active ? 'ATIVA' : 'SUSPENSA'}>{member.active ? 'ATIVO' : 'INATIVO'}</Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {member.id !== currentUser?.id && isAdmin && (
                          <button 
                            onClick={() => triggerDeleteMember(member.id, member.name)}
                            className="p-2 text-text-tertiary hover:text-danger transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
               <Database className="text-primary" size={24} />
               <h3 className="text-lg font-bold text-white uppercase italic tracking-tight">MANUTENÇÃO DO BANCO</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-background-tertiary/20 border border-border rounded-xl">
                 <p className="text-[10px] font-bold text-text-tertiary uppercase mb-2">Exportar Dados Operacionais</p>
                 <p className="text-xs text-text-secondary mb-4 leading-relaxed">Crie uma cópia de segurança local de todos os perfis, contas, custos e scripts cadastrados.</p>
                 <Button variant="outline" icon={Download} onClick={handleExportBackup} className="w-full uppercase font-bold text-[10px]">BAIXAR BACKUP (JSON)</Button>
              </div>
              <div className="p-4 bg-background-tertiary/20 border border-border rounded-xl">
                 <p className="text-[10px] font-bold text-text-tertiary uppercase mb-2">Atualizar Schema</p>
                 <p className="text-xs text-text-secondary mb-4 leading-relaxed">Força a sincronização dos dados locais com o servidor Supabase para corrigir inconsistências.</p>
                 <Button variant="secondary" icon={RefreshCw} onClick={() => window.location.reload()} className="w-full uppercase font-bold text-[10px]">RECARREGAR SISTEMA</Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
               <ShieldCheck className="text-success" size={24} />
               <h3 className="text-lg font-bold text-white uppercase italic tracking-tight">INTEGRIDADE DE ACESSO</h3>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-4 border border-border rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-white">Sessão Ativa</p>
                    <p className="text-[10px] text-text-secondary">{currentUser?.email}</p>
                  </div>
                  <Badge status="ATIVA">PROTEGIDO</Badge>
               </div>
               <div className="flex justify-between items-center p-4 border border-border rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-white">Versão do Sistema</p>
                    <p className="text-[10px] text-text-secondary">Build 2.5.0-PRO-IMAGE</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary">v.2.5.0</span>
               </div>
               <div className="p-4 border border-border-input border-dashed rounded-xl flex items-center justify-center">
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest italic">XCoting Protection Engine Enabled</p>
               </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modais de Gerenciamento de Membros */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="VINCULAR MEMBRO">
        <form onSubmit={handlePromoteMember} className="space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 mb-2">
             <AlertCircle size={18} className="text-primary mt-0.5" />
             <p className="text-[10px] text-text-secondary leading-relaxed uppercase font-bold">
               O membro precisa ter se cadastrado no sistema antes de ser vinculado à sua equipe. Digite o email exato do cadastro.
             </p>
          </div>
          
          {error && <div className="p-3 bg-danger/10 text-danger border border-danger/20 rounded text-xs font-bold uppercase">{error}</div>}
          {success && <div className="p-3 bg-success/10 text-success border border-success/20 rounded text-xs font-bold uppercase">{success}</div>}

          <Input 
            label="EMAIL DO MEMBRO" 
            placeholder="email@membro.com" 
            value={searchEmail} 
            onChange={e => setSearchEmail(e.target.value)} 
            icon={Mail}
            required
          />
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase">CARGO NO SISTEMA</label>
            <select 
              className="w-full bg-background-primary border border-border-input rounded px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as UserRole)}
            >
               <option value="operador">OPERADOR (GERENCIA CONTAS E SCRIPTS)</option>
               <option value="view">VISUALIZADOR (APENAS LEITURA)</option>
               <option value="acesso_total">ADMIN (CONTROLE TOTAL)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
             <Button variant="ghost" type="button" onClick={() => setIsMemberModalOpen(false)}>CANCELAR</Button>
             <Button type="submit" isLoading={isProcessing}>CONCEDER ACESSO</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="CONFIRMAR EXCLUSÃO">
        <div className="space-y-6">
           <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                 <AlertTriangle size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white uppercase italic">REMOVER MEMBRO?</h4>
                <p className="text-sm text-text-secondary">Você está prestes a remover o acesso de <span className="text-white font-bold">{memberToDelete?.name}</span>. Esta ação não pode ser desfeita.</p>
              </div>
           </div>
           <div className="flex gap-4">
              <Button variant="ghost" className="flex-1" onClick={() => setIsConfirmDeleteOpen(false)}>CANCELAR</Button>
              <Button variant="danger" className="flex-1" onClick={handleConfirmRemove} isLoading={isProcessing}>REMOVER ACESSO</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
