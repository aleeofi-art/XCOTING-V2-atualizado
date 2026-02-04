import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { AdAccount, Platform, AccountStatus, Script, CaseLog } from '../types';
import {
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Edit,
  Save,
  CreditCard,
  TerminalSquare
} from 'lucide-react';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>(Platform.GOOGLE);
  const [accName, setAccName] = useState('');
  const [accId, setAccId] = useState('');

  const [accountLogs, setAccountLogs] = useState<CaseLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const accs = await db.data.getAccounts();
    const scrs = await db.data.getScripts();
    setAccounts([...accs]);
    setScripts(scrs);
  };

  const openCreateDrawer = () => {
    setAccName('');
    setAccId('');
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (acc: AdAccount) => {
    setPlatform(acc.platform);
    setAccName(acc.account_name);
    setAccId(acc.account_id);
    setEditingAccountId(acc.id);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const handleDeleteAccount = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.data.deleteAccount(id);
    await loadData();
  };

  const handleSave = async () => {
    if (!accName || !accId) return;

    if (drawerMode === 'create') {
      await db.data.createAccount({
        platform,
        name: accName,
        accountId: accId
      });
    }

    if (drawerMode === 'edit' && editingAccountId) {
      await db.data.updateAccount(editingAccountId, {
        account_name: accName,
        account_id: accId
      });
    }

    setIsDrawerOpen(false);
    await loadData();
  };

  const filteredAccounts = accounts.filter(a =>
    a.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen p-8 bg-[#0a0f1a] text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold uppercase">Inventário de Ativos</h1>

        <button
          onClick={openCreateDrawer}
          className="bg-indigo-600 px-4 py-2 flex items-center gap-2"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {/* TABLE */}
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/40">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredAccounts.map(acc => (
              <tr key={acc.id} className="border-t border-white/10">
                <td className="p-3">{acc.account_name}</td>
                <td className="p-3 font-mono">{acc.account_id}</td>
                <td className="p-3 text-right flex justify-end gap-2">
                  <button onClick={() => openEditDrawer(acc)}>
                    <Edit size={14} />
                  </button>

                  <button onClick={(e) => handleDeleteAccount(acc.id, e)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAccounts.length === 0 && (
          <div className="p-10 text-center opacity-40">
            <CreditCard size={32} className="mx-auto mb-2" />
            Nenhum ativo
          </div>
        )}
      </div>

      {/* DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-[#111] p-6 w-[400px] rounded-lg space-y-4">

            <input
              placeholder="Nome"
              value={accName}
              onChange={e => setAccName(e.target.value)}
              className="w-full p-2 bg-black border border-white/10"
            />

            <input
              placeholder="ID"
              value={accId}
              onChange={e => setAccId(e.target.value)}
              className="w-full p-2 bg-black border border-white/10 font-mono"
            />

            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 py-2"
            >
              <Save size={14} className="inline mr-2" />
              Salvar
            </button>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-full opacity-50"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
