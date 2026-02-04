import React, { useState, useMemo } from 'react';
import { Wallet, Globe, Server, Calendar, Plus, Trash2, User } from 'lucide-react';
import { shallow } from 'zustand/shallow';
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
  const totals = useAppStore(selectCostTotals, shallow);
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

  // 🔥 SAFE (evita crash)
  const allAccounts = useMemo(() => {
    return profiles.flatMap(p =>
      (p.accounts ?? []).map(a => ({
        ...a,
        profileName: p.name
      }))
    );
  }, [profiles]);

  const accountCostsTotal = useMemo(() => {
    return costs
      .filter(c => c.accountId)
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
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

      // 🔥 FIX AQUI (antes era customerId errado)
      accountName: newCost.type === 'CONTA'
        ? selectedAcc?.account_name
        : undefined,

      userName: user?.name || 'SYSTEM'
    };

    await addCost(cost);

    setIsModalOpen(false);

    setNewCost({
      type: 'GLOBAL',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: '',
      description: '',
      accountId: ''
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight italic">
            CUSTO OPERACIONAL
          </h2>
          <div className="flex items-center gap-2">
            <Badge status="GLOBAL & CONTAS" />
            <p className="text-text-secondary text-sm italic">
              Visão unificada de custos do time.
            </p>
          </div>
        </div>

        {canEdit && (
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
            ADICIONAR CUSTO
          </Button>
        )}
      </div>

      {/* resto da UI permanece igual */}
    </div>
  );
};

export default Costs;
