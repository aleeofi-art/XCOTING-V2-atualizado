
import React, { useState, useMemo } from 'react';
import { Wallet, Globe, Server, Calendar, Plus, Trash2, User } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Card, Button, Input, Modal, Badge, Textarea } from '../components/ui';
import { OperationalCost } from '../types';
import { useAppStore, selectCostTotals } from '../store';
import { useAuth } from '../hooks/useAuth';
import { generateUUID } from '../utils/dbSanitize';

const Costs: React.FC = () => {
  const costs = useAppStore(s => s.costs ?? []);
  const addCost = useAppStore(s => s.addCost);
  const removeCost = useAppStore(s => s.removeCost);
  const profiles = useAppStore(s => s.profiles ?? []);
  const totals = useAppStore(useShallow(selectCostTotals));
  const { canEdit, canDelete, user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCost, setNewCost] = useState<Partial<OperationalCost>>({
    type: 'GLOBAL',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: '',
    description: '',
    accountId: ''
  });

  const allAccounts = useMemo(() => {
    return profiles.flatMap(p => p.accounts.map(a => ({ ...a, profileName: p.name })));
  }, [profiles]);

  const accountCostsTotal = useMemo(() => {
    return costs.filter(c => c.accountId).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  }, [costs]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    const selectedAcc = allAccounts.find(a => a.id === newCost.accountId);

    const cost: OperationalCost = {
      id: generateUUID(),
      type: newCost.type as 'GLOBAL' | 'CONTA',
      date: newCost.date || new Date().toISOString().split('T')[0],
      amount: Number(newCost.amount) || 0,
      category: newCost.category || 'Geral',
      description: newCost.description,
      accountId: newCost.type === 'CONTA' ? newCost.accountId : undefined,
      accountName: newCost.type === 'CONTA' ? selectedAcc?.customerId : undefined,
      userName: user?.name || 'SYSTEM'
    };

    await addCost(cost);
    setIsModalOpen(false);
    setNewCost({ type: 'GLOBAL', date: new Date().toISOString().split('T')[0], amount: 0, category: '', description: '', accountId: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight italic">CUSTO OPERACIONAL</h2>
          <div className="flex items-center gap-2">
            <Badge status="GLOBAL & CONTAS" />
            <p className="text-text-secondary text-sm italic">Visão unificada de custos do time.</p>
          </div>
        </div>
        {canEdit && <Button icon={Plus} onClick={() => setIsModalOpen(true)}>ADICIONAR CUSTO</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
           <div className="p-3 rounded-full bg-success/10 text-success"><Wallet size={24} /></div>
           <div><p className="text-xs text-text-secondary uppercase">Gasto Hoje</p><h3 className="text-2xl font-bold text-white">R$ {(totals.today ?? 0).toFixed(2)}</h3></div>
        </Card>
        <Card className="flex items-center gap-4">
           <div className="p-3 rounded-full bg-primary/10 text-primary"><Calendar size={24} /></div>
           <div><p className="text-xs text-text-secondary uppercase">Gasto Mensal</p><h3 className="text-2xl font-bold text-white">R$ {(totals.month ?? 0).toFixed(2)}</h3></div>
        </Card>
        <Card className="flex items-center gap-4">
           <div className="p-3 rounded-full bg-warning/10 text-warning"><Server size={24} /></div>
           <div><p className="text-xs text-text-secondary uppercase">Custos de Contas</p><h3 className="text-2xl font-bold text-white">R$ {accountCostsTotal.toFixed(2)}</h3></div>
        </Card>
        <Card className="flex items-center gap-4">
           <div className="p-3 rounded-full bg-danger/10 text-danger"><Globe size={24} /></div>
           <div><p className="text-xs text-text-secondary uppercase">Custos Globais</p><h3 className="text-2xl font-bold text-white">R$ {(totals.global ?? 0).toFixed(2)}</h3></div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold mb-6 uppercase italic">HISTÓRICO DE LANÇAMENTOS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background-tertiary text-xs text-text-secondary uppercase border-b border-border">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Origem</th>
                <th className="py-3 px-4">Conta</th>
                <th className="py-3 px-4">Categoria / Operador</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {costs.map(cost => (
                <tr key={cost.id} className="hover:bg-background-tertiary/50 transition-colors text-sm">
                  <td className="py-3 px-4 text-text-secondary">{new Date(cost.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4"><Badge status={cost.type} /></td>
                  <td className="py-3 px-4 font-mono text-white italic">{cost.accountName || 'Global'}</td>
                  <td className="py-3 px-4">
                     <div className="flex flex-col">
                        <span className="font-medium text-white">{cost.category}</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                           <User size={10} /> {cost.userName || 'SISTEMA'}
                        </span>
                     </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-danger">R$ {(cost.amount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                      {canDelete && <button onClick={() => removeCost(cost.id)} className="text-text-tertiary hover:text-danger"><Trash2 size={16} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="ADICIONAR CUSTO">
         <form onSubmit={handleSave} className="space-y-4">
            <select className="w-full bg-background-primary border border-border-input rounded px-4 py-2.5 text-sm text-white outline-none" value={newCost.type} onChange={e => setNewCost({...newCost, type: e.target.value as any})}>
               <option value="GLOBAL">GLOBAL</option>
               <option value="CONTA">CONTA</option>
            </select>
            {newCost.type === 'CONTA' && (
              <select className="w-full bg-background-primary border border-border-input rounded px-4 py-2.5 text-sm text-white outline-none" value={newCost.accountId} onChange={e => setNewCost({...newCost, accountId: e.target.value})} required>
                 <option value="">Selecione a Conta...</option>
                 {allAccounts.map(a => <option key={a.id} value={a.id}>{a.customerId} - {a.email}</option>)}
              </select>
            )}
            <Input label="Categoria" value={newCost.category} onChange={e => setNewCost({...newCost, category: e.target.value})} required />
            <Input label="Valor (R$)" type="number" step="0.01" value={newCost.amount} onChange={e => setNewCost({...newCost, amount: Number(e.target.value)})} required />
            <Input label="Data" type="date" value={newCost.date} onChange={e => setNewCost({...newCost, date: e.target.value})} required />
            <Textarea label="Descrição" value={newCost.description} onChange={e => setNewCost({...newCost, description: e.target.value})} />
            <div className="pt-4 flex justify-end gap-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
               <Button type="submit">Salvar Custo</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
};

export default Costs;
