import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, AlertTriangle, ShieldCheck, Clock, 
  DollarSign, Edit3, CheckCircle, AlertOctagon, X 
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button, Input, Badge, Textarea, Modal, MetricWidget, Card } from '../components/ui';
import { Suspension, AdAccount } from '../types';
import { useAppStore } from '../store';
import { suspensionsService } from '../services/suspensionsService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const Suspensions: React.FC = () => {
  const { profiles } = useAppStore(useShallow(state => ({
    profiles: state.profiles || []
  })));
  
  const { canEdit } = useAuth();
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSuspension, setSelectedSuspension] = useState<Suspension | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    account_id: '',
    suspension_type: 'Política de Uso',
    suspension_reason: ''
  });

  const [editData, setEditData] = useState({
    status: 'pending',
    recovery_cost: 0,
    recovery_notes: ''
  });

  // Accounts list for dropdown
  const allAccounts = useMemo(() => {
    return profiles.flatMap(p => p.accounts.map(a => ({ ...a, profileName: p.name })));
  }, [profiles]);

  const loadSuspensions = async () => {
    setIsLoading(true);
    const data = await suspensionsService.getSuspensions();
    setSuspensions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSuspensions();
  }, []);

  const metrics = useMemo(() => {
    const total = suspensions.length;
    const pending = suspensions.filter(s => s.status === 'pending').length;
    const recovered = suspensions.filter(s => s.status === 'recovered').length;
    const totalCost = suspensions.reduce((acc, s) => acc + (s.recovery_cost || 0), 0);
    
    return { total, pending, recovered, totalCost };
  }, [suspensions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account_id) return;

    const result = await suspensionsService.createSuspension(formData);
    if (result) {
      const now = new Date().toISOString();
      const account = allAccounts.find(a => a.id === formData.account_id);

      const updates: any = {
        last_suspension_at: now,
        suspension_count: (account?.suspension_count || 0) + 1
      };

      if (account?.status === 'ATIVA') {
        updates.status = 'CONTESTADA';
      }

      await supabase
        .from('accounts')
        .update(updates)
        .eq('id', formData.account_id);
      
      setIsCreateModalOpen(false);
      setFormData({ account_id: '', suspension_type: 'Política de Uso', suspension_reason: '' });
      loadSuspensions();
      useAppStore.getState().initialize();
    }
  };

  const handleEdit = (suspension: Suspension) => {
    setSelectedSuspension(suspension);
    setEditData({
      status: suspension.status,
      recovery_cost: suspension.recovery_cost || 0,
      recovery_notes: suspension.recovery_notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuspension) return;

    const updates: any = {
      status: editData.status,
      recovery_cost: Number(editData.recovery_cost),
      recovery_notes: editData.recovery_notes
    };

    if (editData.status === 'recovered') {
      updates.resolved_at = new Date().toISOString();
    }

    const success = await suspensionsService.updateSuspension(selectedSuspension.id, updates);
    if (success) {
      const now = new Date().toISOString();
      const accountUpdates: any = { last_suspension_at: now };

      if (editData.status === 'recovered') {
        const { data: otherPending } = await supabase
          .from('suspensions')
          .select('id')
          .eq('account_id', selectedSuspension.account_id)
          .eq('status', 'pending')
          .neq('id', selectedSuspension.id);

        if (!otherPending || otherPending.length === 0) {
          accountUpdates.status = 'RECUPERADA';
        }
      }

      await supabase
        .from('accounts')
        .update(accountUpdates)
        .eq('id', selectedSuspension.account_id);
      
      setIsEditModalOpen(false);
      loadSuspensions();
      useAppStore.getState().initialize();
    }
  };

  const filteredSuspensions = suspensions.filter(s => {
    const account = allAccounts.find(a => a.id === s.account_id);
    return (
      s.suspension_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.suspension_reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.customerId.includes(searchTerm)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recovered': return <Badge status="RECUPERADA" />;
      case 'pending': return <Badge status="CONTESTADA" />;
      case 'permanent': return <Badge status="BLOQUEADA" />;
      default: return <Badge status={status} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight italic">SUSPENSÕES</h2>
          <p className="text-text-secondary text-xs flex items-center gap-2">Monitoramento de Bloqueios e Recuperações.</p>
        </div>
        {canEdit && <Button onClick={() => setIsCreateModalOpen(true)} icon={Plus} className="bg-primary hover:bg-primary-hover shadow-glow-primary">NOVA SUSPENSÃO</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricWidget title="TOTAL SUSPENSÕES" value={metrics.total} icon={AlertTriangle} color="text-white" />
        <MetricWidget title="PENDENTES" value={metrics.pending} icon={Clock} color="text-warning" />
        <MetricWidget title="RECUPERADAS" value={metrics.recovered} icon={ShieldCheck} color="text-success" />
        <MetricWidget title="CUSTO RECOVERY" value={`R$ ${metrics.totalCost.toFixed(2)}`} icon={DollarSign} color="text-danger" />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID, tipo ou motivo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background-secondary border border-border-input rounded-button pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <Button variant="outline" icon={Filter} className="text-xs uppercase font-bold">Filtros</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background-tertiary text-[10px] text-text-secondary uppercase font-bold border-b border-border">
              <tr>
                <th className="py-4 px-6">Conta / ID</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6">Motivo</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6">Detectada em</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="py-10 text-center text-text-tertiary animate-pulse">Carregando...</td></tr>
              ) : filteredSuspensions.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-text-tertiary italic">Nenhuma suspensão.</td></tr>
              ) : (
                filteredSuspensions.map(s => {
                  const account = allAccounts.find(a => a.id === s.account_id);
                  return (
                    <tr key={s.id} className="hover:bg-background-tertiary/20 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm italic">{account?.profileName || 'Conta'}</span>
                          <span className="text-[10px] text-text-tertiary font-mono">{account?.customerId || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-text-primary font-bold">{s.suspension_type}</td>
                      <td className="py-4 px-6"><p className="text-xs text-text-secondary line-clamp-1 max-w-[200px]">{s.suspension_reason}</p></td>
                      <td className="py-4 px-6 text-center">{getStatusBadge(s.status)}</td>
                      <td className="py-4 px-6 text-[10px] text-text-tertiary font-mono">{new Date(s.detected_at).toLocaleString('pt-BR')}</td>
                      <td className="py-4 px-6 text-right"><Button size="sm" variant="secondary" icon={Edit3} onClick={() => handleEdit(s)}>Editar</Button></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="NOVA SUSPENSÃO">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Conta</label>
            <select 
              required
              className="w-full bg-background-primary border border-border-input rounded px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              value={formData.account_id}
              onChange={e => setFormData({...formData, account_id: e.target.value})}
            >
              <option value="">Selecione...</option>
              {allAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.customerId} - {a.email}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase">Tipo</label>
            <select 
              className="w-full bg-background-primary border border-border-input rounded px-4 py-2.5 text-sm text-white outline-none"
              value={formData.suspension_type}
              onChange={e => setFormData({...formData, suspension_type: e.target.value})}
            >
              <option value="Fraude de Sistema">Fraude de Sistema</option>
              <option value="Pagamento Suspeito">Pagamento Suspeito</option>
              <option value="Práticas Inaceitáveis">Práticas Inaceitáveis</option>
              <option value="Verificação Falhou">Verificação Falhou</option>
            </select>
          </div>
          <Textarea label="Motivo Detalhado" required value={formData.suspension_reason} onChange={e => setFormData({...formData, suspension_reason: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>CANCELAR</Button>
            <Button type="submit">SALVAR SUSPENSÃO</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="EDITAR STATUS">
        <form onSubmit={handleUpdate} className="space-y-6">
          <select className="w-full bg-background-primary border border-border-input rounded px-4 py-2.5 text-sm text-white outline-none" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
              <option value="pending">Pendente</option>
              <option value="recovered">Recuperada</option>
              <option value="permanent">Permanente</option>
          </select>
          <Input label="Custo Recovery (R$)" type="number" step="0.01" value={editData.recovery_cost} onChange={e => setEditData({...editData, recovery_cost: Number(e.target.value)})} />
          <Textarea label="Notas" value={editData.recovery_notes} onChange={e => setEditData({...editData, recovery_notes: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>CANCELAR</Button>
            <Button type="submit">ATUALIZAR STATUS</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suspensions;