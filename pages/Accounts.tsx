import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { AdAccount, Platform, AccountStatus, Script, CaseLog } from '../types';
import {
  Search, Plus, MoreHorizontal, X, History,
  CheckCircle2, LayoutGrid,
  Trash2, Edit, Save, CreditCard, Clock, TerminalSquare, RefreshCw
} from 'lucide-react';

// Comprehensive Suspension Reasons
const SUSPENSION_REASONS = {
  [Platform.GOOGLE]: [
    'Técnicas de cloaking → Circumventing Systems',
    'Fraude de sistema: criação indevida de várias contas → Circumventing Systems – Multiple Account Abuse',
    'Preocupações de pagamento futuro → Suspicious Payment Activity',
    'Práticas comerciais inaceitáveis → Unacceptable Business Practices',
    'Operações comerciais → Business Operations Policy Violation'
  ],
  [Platform.META]: [
    'Atividade Incomum na Conta (Unusual Activity)',
    'Restrição de Publicidade (Advertising Access Restricted)',
    'Violação de Política de Publicidade',
    'Identidade Não Confirmada',
    'Falha no Pagamento / Cartão Recusado',
    'Contorno de Sistemas (Circumventing Systems)',
    'Qualidade da Conta Baixa (Account Quality)',
    'Associação com Ativos Restritos',
    'Bloqueio de Business Manager (BM)',
    'Página Restrita (Fanpage Ban)'
  ],
  [Platform.TIKTOK]: [
    'Práticas de Negócios Inaceitáveis',
    'Problemas com Pagamento / Saldo',
    'Violação de Política de Criativos',
    'Página de Destino (Landing Page) Irregular',
    'Promoção de Produtos Proibidos',
    'Conta Suspensa por Risco',
    'Comportamento Fraudulento',
    'Propriedade Intelectual'
  ]
};

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // Form State
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>(Platform.GOOGLE);
  const [accName, setAccName] = useState('');
  const [accId, setAccId] = useState('');
  
  // Contingency State
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState(SUSPENSION_REASONS[Platform.GOOGLE][0]);
  const [appealScript, setAppealScript] = useState('');
  
  // Recovery Actions State
  const [recoveryActions, setRecoveryActions] = useState<string[]>([]);
  const [accountLogs, setAccountLogs] = useState<CaseLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // Reset block reason when platform changes
  useEffect(() => {
    if (SUSPENSION_REASONS[platform]) {
      setBlockReason(SUSPENSION_REASONS[platform][0]);
    }
  }, [platform]);

  const loadData = async () => {
    const accs = await db.data.getAccounts();
    const scrs = await db.data.getScripts();
    setAccounts([...accs]);
    setScripts(scrs);
  };

  const resetForm = () => {
    setPlatform(Platform.GOOGLE);
    setAccName('');
    setAccId('');
    setIsBlocked(false);
    // Set default reason based on default platform
    setBlockReason(SUSPENSION_REASONS[Platform.GOOGLE][0]);
    setAppealScript('');
    setRecoveryActions([]);
    setEditingAccountId(null);
  };

  const openCreateDrawer = () => {
    resetForm();
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (acc: AdAccount) => {
    setPlatform(acc.platform);
    setAccName(acc.account_name);
    setAccId(acc.account_id);
    setEditingAccountId(acc.id);
    setIsBlocked(acc.status === AccountStatus.DISABLED);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const openViewDrawer = (acc: AdAccount) => {
    setPlatform(acc.platform);
    setAccName(acc.account_name);
    setAccId(acc.account_id);
    setEditingAccountId(acc.id);
    setDrawerMode('view');
    setAccountLogs([
      { id: '1', case_id: '1', user_id: '1', user_name: 'Sistema', action: 'Conta Criada', notes: 'Importação manual', created_at: acc.last_action_at || new Date().toISOString(), type: 'status_change' }
    ]);
    setIsDrawerOpen(true);
  };

  const handleDeleteAccount = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este ativo? Todos os casos vinculados na War Room também serão removidos.')) {
      await db.data.deleteAccount(id);
      await loadData();
    }
  };

  const toggleRecoveryAction = (action: string) => {
    if (recoveryActions.includes(action)) {
      setRecoveryActions(recoveryActions.filter(a => a !== action));
    } else {
      setRecoveryActions([...recoveryActions, action]);
    }
  };

  const handleSave = async () => {
    if (!accName.trim() || !accId.trim()) return alert('ERRO: Preencha o Nome e o ID Operacional da conta.');
    
    try {
      if (drawerMode === 'create') {
        await db.data.createAccount({
          platform,
          name: accName,
          accountId: accId,
          isBlocked: isBlocked,
          suspensionReason: isBlocked ? blockReason : undefined,
          scriptContent: isBlocked ? appealScript : undefined,
          recoveryActions: isBlocked ? recoveryActions : undefined
        });
        alert('ATIVO SINCRONIZADO: Conta criada e caso enviado para War Room com sucesso.');
      } else if (drawerMode === 'edit' && editingAccountId) {
        await db.data.updateAccount(editingAccountId, {
          platform,
          account_name: accName,
          account_id: accId,
          status: isBlocked ? AccountStatus.DISABLED : AccountStatus.ACTIVE
        });
        alert('ATIVO ATUALIZADO: Dados sincronizados.');
      }

      setIsDrawerOpen(false);
      await loadData();
    } catch (e) {
      alert('Erro ao salvar no banco de dados.');
    }
  };

  const filteredAccounts = accounts.filter(a => 
    a.account_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.account_id.includes(searchTerm)
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-100px)]">
        
        {/* Ops Title */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase font-sans">INVENTÁRIO DE ATIVOS</h2>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
               <TerminalSquare size={14} /> GESTÃO PROFISSIONAL DE GOOGLE ADS
            </p>
          </div>
          <button 
            onClick={openCreateDrawer} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-none skew-x-[-10deg] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400"
          >
            <span className="skew-x-[10deg] inline-block flex items-center gap-2">
               <Plus size={14} /> Adicionar Ativo
            </span>
          </button>
        </div>

        {/* Data Grid Container */}
        <div className="flex-1 bg-[#0a0f1a] border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-2xl relative">
           
           {/* Scanline decoration */}
           <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f1623] text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold border-b border-white/5">
                  <th className="px-6 py-5">Nome Conta</th>
                  <th className="px-6 py-5">ID Operacional</th>
                  <th className="px-6 py-5"><span className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">Tipo Contestação</span></th>
                  <th className="px-6 py-5"><span className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded">Status</span></th>
                  <th className="px-6 py-5">Data/Hora</th>
                  <th className="px-6 py-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => openViewDrawer(acc)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${acc.platform === Platform.GOOGLE ? 'bg-blue-500' : acc.platform === Platform.META ? 'bg-blue-400' : 'bg-pink-500'}`}></div>
                         <span className="font-bold text-slate-200 text-sm">{acc.account_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500 tracking-wider text-indigo-300">{acc.account_id}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {acc.status === AccountStatus.DISABLED ? 'Bloqueio Nível 1' : 'N/A'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      {acc.status === AccountStatus.ACTIVE && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Ativo</span>}
                      {acc.status === AccountStatus.DISABLED && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">Bloqueado</span>}
                      {acc.status === AccountStatus.RESTRICTED && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">Restrito</span>}
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-mono text-[10px] text-slate-500">{formatDate(acc.last_action_at)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openEditDrawer(acc); }} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white"><Edit size={14} /></button>
                          <button onClick={(e) => handleDeleteAccount(acc.id, e)} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Empty State */}
            {filteredAccounts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 border-t border-white/5">
                 <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 mb-4">
                    <CreditCard size={32} />
                 </div>
                 <h3 className="text-sm font-bold text-slate-600 uppercase tracking-[0.2em]">Inventário Vazio no Banco</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DRAWER */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#080c14] border-l border-white/10 shadow-2xl z-50 flex flex-col">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#050b14]">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                 <TerminalSquare size={18} className="text-indigo-500"/>
                 {drawerMode === 'create' ? 'NOVO ATIVO' : 'DETALHES DO ATIVO'}
              </h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-500 hover:text-white p-2"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {(drawerMode === 'create' || drawerMode === 'edit') ? (
                  <div className="space-y-8">
                     <div>
                        <label className="block text-[10px] font-bold text-indigo-400 mb-3 uppercase tracking-widest">Plataforma</label>
                        <div className="grid grid-cols-3 gap-3">
                           {Object.values(Platform).map(p => (
                             <button key={p} onClick={() => setPlatform(p)} className={`py-4 border border-white/10 bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-wider hover:bg-white/5 ${platform === p ? 'border-indigo-500 text-white bg-indigo-500/10' : ''}`}>
                                {p}
                             </button>
                           ))}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Nome da Conta</label>
                           <input type="text" className="w-full bg-[#0a0f1a] border border-white/10 p-3 text-white text-sm focus:border-indigo-500 outline-none placeholder:text-slate-700" value={accName} onChange={e => setAccName(e.target.value)} placeholder="IDENTIFICADOR" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">ID Operacional</label>
                           <input type="text" className="w-full bg-[#0a0f1a] border border-white/10 p-3 text-white text-sm font-mono focus:border-indigo-500 outline-none placeholder:text-slate-700" value={accId} onChange={e => setAccId(e.target.value)} placeholder="000-000-0000" />
                        </div>
                     </div>
                     <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3 cursor-pointer mb-6" onClick={() => setIsBlocked(!isBlocked)}>
                           <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isBlocked ? 'bg-red-900' : 'bg-slate-800'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isBlocked ? 'translate-x-5 bg-red-500' : 'bg-slate-400'}`}></div>
                           </div>
                           <span className={`text-xs font-bold uppercase tracking-wider ${isBlocked ? 'text-red-500' : 'text-slate-500'}`}>
                              {isBlocked ? 'Status: BLOQUEADO' : 'Status: OPERACIONAL'}
                           </span>
                        </div>

                        {isBlocked && (
                           <div className="space-y-6 animate-in fade-in slide-in-from-top-2 border border-red-500/20 bg-red-500/5 p-4 rounded">
                              <div>
                                 <label className="text-[10px] text-red-400 mb-2 block font-bold uppercase tracking-widest">Motivo do Bloqueio</label>
                                 <select className="w-full bg-[#050b14] border border-red-900/30 p-3 text-white text-sm focus:border-red-500 outline-none" value={blockReason} onChange={e => setBlockReason(e.target.value)}>
                                   {SUSPENSION_REASONS[platform].map(reason => (
                                     <option key={reason} value={reason}>{reason}</option>
                                   ))}
                                 </select>
                              </div>

                              <div>
                                 <label className="text-[10px] text-indigo-400 mb-2 block font-bold uppercase tracking-widest">Script Enviado (Opcional)</label>
                                 
                                  <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
                                    {scripts.filter(s => s.platform === platform).slice(0, 3).map(s => (
                                       <button 
                                         key={s.id}
                                         onClick={() => setAppealScript(s.content)}
                                         className="text-[9px] px-2 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300 whitespace-nowrap uppercase tracking-wider"
                                       >
                                          {s.title}
                                       </button>
                                    ))}
                                 </div>

                                 <textarea 
                                    className="w-full bg-[#050b14] border border-white/10 p-3 text-white text-xs font-mono focus:border-indigo-500 outline-none h-24"
                                    value={appealScript}
                                    onChange={e => setAppealScript(e.target.value)}
                                    placeholder="Cole o script utilizado aqui para sincronizar com a War Room..."
                                 ></textarea>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[10px] text-slate-500 block font-bold uppercase tracking-widest mb-2">Ações Realizadas</label>
                                 {['Alteração de Perfil de Pagamento', 'Troca de Cartão de Crédito', 'Aquecimento de Perfil'].map(action => (
                                    <label key={action} className="flex items-center gap-3 cursor-pointer group">
                                       <div className={`w-4 h-4 border flex items-center justify-center ${recoveryActions.includes(action) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700'}`}>
                                          {recoveryActions.includes(action) && <CheckCircle2 size={10} className="text-white"/>}
                                       </div>
                                       <input type="checkbox" className="hidden" onChange={() => toggleRecoveryAction(action)}/>
                                       <span className="text-xs text-slate-400 uppercase">{action}</span>
                                    </label>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-10">
                     <div className="inline-block p-4 rounded-full bg-indigo-500/10 text-indigo-500 mb-4"><TerminalSquare size={32}/></div>
                     <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{accName}</h2>
                     <p className="font-mono text-slate-500 mt-2">{accId}</p>
                     <div className="mt-8 border-t border-white/5 pt-8 text-left">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Logs do Sistema</h4>
                        {accountLogs.map(log => (
                           <div key={log.id} className="mb-4 pl-4 border-l border-white/10">
                              <p className="text-xs text-indigo-400 font-bold uppercase">{log.action}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">{new Date(log.created_at).toLocaleString()}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            {(drawerMode === 'create' || drawerMode === 'edit') && (
               <div className="p-6 border-t border-white/5 bg-[#050b14]">
                  <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all">
                     <Save size={16} /> {drawerMode === 'create' ? 'SALVAR E SINCRONIZAR' : 'ATUALIZAR DADOS'}
                  </button>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Accounts;
