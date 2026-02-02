
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, ChevronDown, ChevronRight, 
  Trash2, X, Mail, Lock, CheckCircle, 
  AlertCircle, ShieldCheck, Globe, Server, UserCheck, CreditCard, Calendar, FileCode, Info
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Button, Input, Badge, Textarea, Modal } from '../components/ui';
import { Profile, AdAccount, AccountStatus, Tier, BlockReason } from '../types';
import { useAppStore } from '../store';
import { generateUUID } from '../utils/dbSanitize';
import { useAuth } from '../hooks/useAuth';

// Componente Toggle estilo "Arrasta pro lado" (Slide)
const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <div 
    className="flex justify-between items-center p-4 border border-border rounded-xl bg-background-tertiary/20 hover:border-primary/40 transition-all cursor-pointer group" 
    onClick={() => onChange(!checked)}
  >
    <span className="text-[9px] font-bold text-white uppercase tracking-wider group-hover:text-primary transition-colors">{label}</span>
    <div className={`w-10 h-5 rounded-full transition-all duration-300 relative ${checked ? 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-background-tertiary border border-border'}`}>
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? 'left-6' : 'left-1'}`} />
    </div>
  </div>
);

const BLOCK_REASONS_HIERARCHY: Record<string, string[]> = {
  "Fraude e Contorno de Sitema": [
    "Fraude de sistema (Circumventing systems)",
    "Criação indevida de múltiplas contas",
    "Verificação do anunciante inválida",
    "Contorno de políticas"
  ],
  "Técnicas de Evasão (Cloaking)": [
    "Cloaking",
    "Redirecionamentos enganosos",
    "Bridge pages / rotadores de URL",
    "Mascaramento de domínio ou scripts anti-bot"
  ],
  "Práticas Comerciais Enganosas": [
    "Práticas inaceitáveis",
    "Operações enganosas",
    "Informações falsas ou promessas irreais",
    "Má representação do anunciante"
  ],
  "Pagamentos e Financeiro": [
    "Atividade de pagamento suspeita",
    "Pagamento recusado",
    "Falha de cobrança",
    "Chargeback / estorno",
    "Saldo pendente ou não pago"
  ],
  "Segurança do Site": [
    "Malware",
    "Phishing",
    "Site comprometido",
    "Coleta indevida de dados"
  ],
  "Qualidade da Experience": [
    "Baixa qualidade de landing page",
    "Conteúdo insuficiente ou enganoso",
    "Experiência de usuário ruim"
  ],
  "Violação de Conteúdo/Produtos": [
    "Violação de Conteúdo/Produtos"
  ],
  "Outro": [
    "Outro"
  ]
};

const SectionDivider: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-4 my-6 opacity-60">
    <div className="flex-1 h-[1px] bg-border"></div>
    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">{title}</span>
    <div className="flex-1 h-[1px] bg-border"></div>
  </div>
);

const Accounts: React.FC = () => {
  const { profiles, scripts, removeProfile, canAddAccount, addProfile, updateAccount } = useAppStore(useShallow(s => ({
    profiles: s.profiles ?? [],
    scripts: s.scripts ?? [],
    removeProfile: s.removeProfile,
    canAddAccount: s.canAddAccount,
    addProfile: s.addProfile,
    updateAccount: s.updateAccount
  })));
  
  const { canEdit, canDelete, user } = useAuth();
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const [blockCategory, setBlockCategory] = useState('');
  const [blockSpecific, setBlockSpecific] = useState('');

  const [profileName, setProfileName] = useState('');
  const [adsPowerId, setAdsPowerId] = useState('');
  const [accountData, setAccountData] = useState<Partial<AdAccount>>({
    customerId: '', email: '', password: '', status: 'ATIVA', tier: 'T1', proxy: '', domain: '',
    razaoSocial: '', cardBank: '', cardHolderName: '', cardLastFour: '',
    costGmail: 0, costDomain: 0, costProxy: 0, adsSpent: 0,
    tipoConta: 'farmada', advertiserVerified: false, verificacaoG2: false,
    alteracaoPerfil: false, alteracaoPagamento: false, notes: '',
    dataContestacao: '', dataAtivacao: '', dataRecuperacao: '', blockReasons: [],
    tipoScriptId: ''
  });

  const updateField = (field: string, value: any) => {
    setAccountData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddBlockReason = () => {
    if (!blockSpecific) return;
    const newReason: BlockReason = {
      id: generateUUID(),
      categoria: blockCategory,
      motivo: blockSpecific,
      createdAt: new Date().toISOString()
    };
    updateField('blockReasons', [...(accountData.blockReasons || []), newReason]);
    setBlockSpecific('');
  };

  const handleRemoveBlockReason = (id: string) => {
    updateField('blockReasons', (accountData.blockReasons || []).filter(r => r.id !== id));
  };

  const handleCreateProfile = () => {
    if (!canAddAccount()) { alert("Limite de contas atingido."); return; }
    setModalMode('create');
    setProfileName('');
    setAdsPowerId('');
    setBlockCategory('');
    setBlockSpecific('');
    setAccountData({
      customerId: '', email: '', password: '', status: 'ATIVA', tier: 'T1', proxy: '', domain: '',
      razaoSocial: '', cardBank: '', cardHolderName: '', cardLastFour: '',
      costGmail: 0, costDomain: 0, costProxy: 0, adsSpent: 0,
      tipoConta: 'farmada', advertiserVerified: false, verificacaoG2: false,
      alteracaoPerfil: false, alteracaoPagamento: false, notes: '',
      dataContestacao: '', dataAtivacao: '', dataRecuperacao: '', blockReasons: [],
      tipoScriptId: ''
    });
    setIsModalOpen(true);
  };

  const handleEditAccount = (profile: Profile, account: AdAccount) => {
    setModalMode('edit');
    setSelectedProfileId(profile.id);
    setProfileName(profile.name);
    setAdsPowerId(profile.adsPowerProfileId || '');
    setAccountData({ ...account });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    const investment = (Number(accountData.costGmail) || 0) + (Number(accountData.costDomain) || 0) + (Number(accountData.costProxy) || 0) + (Number(accountData.adsSpent) || 0);

    const finalAccountData = {
      ...accountData,
      totalInvestment: investment,
      updatedAt: new Date().toISOString(),
      lastActionBy: user?.name || 'SISTEMA'
    };

    try {
      if (modalMode === 'create') {
        const newAccId = generateUUID();
        await addProfile({ 
          id: generateUUID(), 
          name: profileName, 
          adsPowerProfileId: adsPowerId, 
          accounts: [{ ...finalAccountData, id: newAccId } as AdAccount], 
          hasActiveAccounts: finalAccountData.status === 'ATIVA', 
          totalSpent: investment 
        });
      } else if (selectedProfileId && accountData.id) {
        await updateAccount(selectedProfileId, accountData.id, finalAccountData, profileName);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar dados.");
    }
  };

  const totalInvestido = useMemo(() => {
    return (Number(accountData.costGmail) || 0) + (Number(accountData.costDomain) || 0) + (Number(accountData.costProxy) || 0) + (Number(accountData.adsSpent) || 0);
  }, [accountData.costGmail, accountData.costDomain, accountData.costProxy, accountData.adsSpent]);

  const selectedScriptName = useMemo(() => {
    return scripts.find(s => s.id === accountData.tipoScriptId)?.title || null;
  }, [accountData.tipoScriptId, scripts]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch { return dateString; }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight italic">GESTÃO DE ATIVOS</h2>
          <p className="text-text-secondary text-xs italic">Controle de contingência em tempo real.</p>
        </div>
        {canEdit && <Button onClick={handleCreateProfile} icon={Plus} className="shadow-glow-primary uppercase font-bold text-xs italic tracking-widest">ADICIONAR PERFIL</Button>}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background-secondary border border-border-input rounded-button pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <Button variant="outline" icon={Filter} className="text-xs uppercase font-bold italic">Filtros</Button>
      </div>

      <div className="bg-background-secondary border border-border-card rounded-card overflow-hidden shadow-card">
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-background-tertiary text-[10px] text-text-secondary uppercase font-bold border-b border-border">
               <tr>
                  <th className="py-4 px-6">Perfil / Infra</th>
                  <th className="py-4 px-6">ID Conta</th>
                  <th className="py-4 px-6 text-center">Investimento</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border">
                {profiles.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-background-cardHover cursor-pointer" onClick={() => {
                       const newSet = new Set(expandedProfiles);
                       if (newSet.has(p.id)) newSet.delete(p.id); else newSet.add(p.id);
                       setExpandedProfiles(newSet);
                    }}>
                      <td className="py-4 px-6">
                         <div className="flex items-center gap-3">
                            {expandedProfiles.has(p.id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                               {p.name.substring(0,2).toUpperCase()}
                            </div>
                            <span className="font-bold text-white text-sm uppercase italic tracking-tighter">{p.name}</span>
                         </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-text-secondary font-mono">{p.accounts?.[0]?.customerId || '---'}</td>
                      <td className="py-4 px-6 text-center font-bold text-white text-sm">R$ {(p.totalSpent || 0).toFixed(2)}</td>
                      <td className="py-4 px-6 text-center"><Badge status={p.accounts?.[0]?.status || 'ATIVA'} /></td>
                      <td className="py-4 px-6 text-right">
                         <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleEditAccount(p, p.accounts[0]); }} className="text-[10px] font-bold uppercase italic">GERENCIAR</Button>
                      </td>
                    </tr>
                    {expandedProfiles.has(p.id) && (p.accounts || []).map(acc => (
                       <tr key={acc.id} className="bg-background-tertiary/5 text-xs border-l-2 border-primary" onClick={() => handleEditAccount(p, acc)}>
                          <td className="py-3 px-6 pl-16">
                             <div className="flex items-center gap-2">
                                <Globe size={12} className="text-text-tertiary" />
                                <span className="text-text-tertiary font-mono">{acc.proxy || 'N/A'}</span>
                             </div>
                          </td>
                          <td className="py-3 px-6 text-text-tertiary font-mono">{acc.customerId}</td>
                          <td className="py-3 px-6 text-center text-danger font-bold">R$ {(acc.totalInvestment || 0).toFixed(2)}</td>
                          <td className="py-3 px-6 text-center"><Badge status={acc.status} /></td>
                          <td className="py-3 px-6 text-right">
                             {canDelete && <button onClick={(e) => { e.stopPropagation(); removeProfile(p.id); }} className="text-text-tertiary hover:text-danger p-1"><Trash2 size={14}/></button>}
                          </td>
                       </tr>
                    ))}
                  </React.Fragment>
                ))}
             </tbody>
           </table>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'NOVO PERFIL' : 'EDITAR PERFIL'} size="xl">
        <div className="flex flex-col lg:flex-row gap-8 relative h-full pb-20">
          {/* LADO ESQUERDO: FORMULÁRIO */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <SectionDivider title="IDS" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="NOME DO PERFIL (GMAIL)" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Ex: ADSPOWER 01" />
              <Input label="ID ADSPOWER (PERFIL)" value={adsPowerId} onChange={e => setAdsPowerId(e.target.value)} placeholder="adspower-xx" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="EMAIL GOOGLE ADS" icon={Mail} value={accountData.email} onChange={e => updateField('email', e.target.value)} placeholder="email@gmail.com" />
              <Input label="SENHA GOOGLE ADS" icon={Lock} type="password" value={accountData.password} onChange={e => updateField('password', e.target.value)} placeholder="••••••••" />
            </div>
            <Input label="ID DA CONTA (GOOGLE ADS)" value={accountData.customerId} onChange={e => updateField('customerId', e.target.value)} placeholder="000-000-0000" />
            
            <SectionDivider title="CONTA" />
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">TIPO DA CONTA</label>
                  <select className="w-full bg-background-primary border border-border-input rounded-button px-4 py-2.5 text-sm text-white outline-none" value={accountData.tipoConta} onChange={e => updateField('tipoConta', e.target.value)}>
                    <option value="farmada">Farmada Própria</option>
                    <option value="comprada">Comprada</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase text-center block w-full">TIER DA CONTA</label>
                  <div className="flex gap-1">
                    {['T1', 'T2', 'T3', 'T4'].map(t => (
                      <button key={t} type="button" onClick={() => updateField('tier', t)} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${accountData.tier === t ? 'bg-primary text-white shadow-glow-primary' : 'bg-background-tertiary text-text-tertiary border border-border hover:border-text-secondary'}`}>{t}</button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="space-y-2 mt-4">
               <label className="text-[10px] font-bold text-text-secondary uppercase block">DEFINIR STATUS</label>
               <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => updateField('status', 'ATIVA')} className={`py-3 text-[10px] font-bold rounded-lg uppercase tracking-widest italic transition-all ${accountData.status === 'ATIVA' ? 'bg-success text-black shadow-glow-success' : 'bg-background-tertiary text-text-tertiary border border-border hover:border-text-secondary'}`}>ATIVA</button>
                  <button type="button" onClick={() => updateField('status', 'CONTESTADA')} className={`py-3 text-[10px] font-bold rounded-lg uppercase tracking-widest italic transition-all ${accountData.status === 'CONTESTADA' ? 'bg-contestada text-white shadow-glow-warning' : 'bg-background-tertiary text-text-tertiary border border-border hover:border-text-secondary'}`}>CONTESTADA</button>
                  <button type="button" onClick={() => updateField('status', 'RECUPERADA')} className={`py-3 text-[10px] font-bold rounded-lg uppercase tracking-widest italic transition-all ${accountData.status === 'RECUPERADA' ? 'bg-recuperada text-white shadow-glow-primary' : 'bg-background-tertiary text-text-tertiary border border-border hover:border-text-secondary'}`}>RECUPERADA</button>
               </div>
            </div>

            <SectionDivider title="MODELO DE SCRIPT" />
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-text-secondary uppercase">VINCULAR SCRIPT DE TRACKING</label>
               <select className="w-full bg-background-primary border border-border-input rounded-button px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer" value={accountData.tipoScriptId} onChange={e => updateField('tipoScriptId', e.target.value)}>
                  <option value="">Selecione um modelo...</option>
                  {['FRAUDE', 'COMERCIAL', 'VERIFICACAO', 'OUTROS'].map(cat => {
                    const catScripts = scripts.filter(s => s.category === cat);
                    if (catScripts.length === 0) return null;
                    return (
                      <optgroup key={cat} label={cat} className="bg-background-modal text-primary font-bold">
                        {catScripts.map(s => <option key={s.id} value={s.id} className="bg-background-primary text-white font-normal">{s.title}</option>)}
                      </optgroup>
                    );
                  })}
               </select>
            </div>

            <SectionDivider title="INFRAESTRUTURA" />
            <div className="grid grid-cols-2 gap-4">
               <Input label="PROXY (IP:PORT)" icon={Globe} value={accountData.proxy} onChange={e => updateField('proxy', e.target.value)} placeholder="127.0.0.1:8080" />
               <Input label="DOMÍNIO(S)" icon={Server} value={accountData.domain} onChange={e => updateField('domain', e.target.value)} placeholder="meusite.com" />
            </div>

            <SectionDivider title="FINANCEIRO" />
            <div className="grid grid-cols-2 gap-4">
               <Input label="RAZÃO SOCIAL / NOME EMPRESA" value={accountData.razaoSocial} onChange={e => updateField('razaoSocial', e.target.value)} placeholder="Minha Empresa Ltda" />
               <Input label="BANCO EMISSOR" icon={CreditCard} value={accountData.cardBank} onChange={e => updateField('cardBank', e.target.value)} placeholder="Nubank" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="NOME TITULAR" value={accountData.cardHolderName} onChange={e => updateField('cardHolderName', e.target.value)} placeholder="JOÃO SILVA" />
               <Input label="FINAL 4 DÍGITOS" value={accountData.cardLastFour} onChange={e => updateField('cardLastFour', e.target.value)} placeholder="1234" />
            </div>
            
            <div className="grid grid-cols-4 gap-2 bg-background-tertiary/20 p-4 rounded-xl border border-border mt-4">
               <Input label="CUSTO GMAIL" type="number" value={accountData.costGmail} onChange={e => updateField('costGmail', Number(e.target.value))} />
               <Input label="CUSTO DOMÍNIO" type="number" value={accountData.costDomain} onChange={e => updateField('costDomain', Number(e.target.value))} />
               <Input label="CUSTO PROXY" type="number" value={accountData.costProxy} onChange={e => updateField('costProxy', Number(e.target.value))} />
               <Input label="GASTO ADS" type="number" value={accountData.adsSpent} onChange={e => updateField('adsSpent', Number(e.target.value))} />
            </div>

            <SectionDivider title="BLOQUEIO" />
            <div className="flex gap-2 items-end">
               <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">CATEGORIA</label>
                  <select className="w-full bg-background-primary border border-border-input rounded-button px-4 py-2.5 text-sm text-white outline-none cursor-pointer" value={blockCategory} onChange={e => { setBlockCategory(e.target.value); setBlockSpecific(''); }}>
                     <option value="">Selecione...</option>
                     {Object.keys(BLOCK_REASONS_HIERARCHY).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
               </div>
               <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">MOTIVO ESPECÍFICO</label>
                  <select className="w-full bg-background-primary border border-border-input rounded-button px-4 py-2.5 text-sm text-white outline-none cursor-pointer" disabled={!blockCategory} value={blockSpecific} onChange={e => setBlockSpecific(e.target.value)}>
                     <option value="">Selecione...</option>
                     {blockCategory && BLOCK_REASONS_HIERARCHY[blockCategory].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
               <button type="button" onClick={handleAddBlockReason} disabled={!blockSpecific} className="h-10 w-10 bg-primary rounded-button flex items-center justify-center text-white disabled:opacity-30 transition-all hover:bg-primary-hover"><Plus size={20} /></button>
            </div>
            <div className="p-4 bg-background-primary/50 border border-border rounded min-h-[80px]">
               <label className="text-[9px] font-bold text-text-tertiary uppercase block mb-2">MOTIVOS SELECIONADOS:</label>
               <div className="flex flex-wrap gap-2">
                 {(accountData.blockReasons || []).length === 0 ? <span className="text-[10px] text-text-muted italic opacity-50">Nenhum motivo registrado.</span> : 
                  accountData.blockReasons?.map(r => <span key={r.id} className="bg-danger/10 border border-danger/20 text-danger-alt px-2 py-1 rounded text-[10px] font-bold flex items-center gap-2 group">{r.motivo}<button type="button" onClick={() => handleRemoveBlockReason(r.id)}><X size={12}/></button></span>)}
               </div>
            </div>

            <SectionDivider title="ALTERAÇÕES" />
            <div className="grid grid-cols-2 gap-4">
               <Toggle label="ALTERAÇÃO PERFIL" checked={!!accountData.alteracaoPerfil} onChange={val => updateField('alteracaoPerfil', val)} />
               <Toggle label="PAGAMENTO" checked={!!accountData.alteracaoPagamento} onChange={val => updateField('alteracaoPagamento', val)} />
            </div>

            <SectionDivider title="VERIFICAÇÕES" />
            <div className="grid grid-cols-2 gap-4">
               <Toggle label="VERIFICAÇÃO DE ANUNCIANTE CONCLUÍDA" checked={!!accountData.advertiserVerified} onChange={val => updateField('advertiserVerified', val)} />
               <Toggle label="VERIFICAÇÃO G2 (FINANCEIRO)" checked={!!accountData.verificacaoG2} onChange={val => updateField('verificacaoG2', val)} />
            </div>

            <SectionDivider title="OBSERVAÇÕES" />
            <div className="grid grid-cols-3 gap-2">
               <Input label="DATA DE CONTESTAÇÃO" type="date" value={accountData.dataContestacao || ''} onChange={e => updateField('dataContestacao', e.target.value)} icon={Calendar} />
               <Input label="DATA DE ATIVAÇÃO" type="date" value={accountData.dataAtivacao || ''} onChange={e => updateField('dataAtivacao', e.target.value)} icon={Calendar} />
               <Input label="DATA DE RECUPERAÇÃO" type="date" value={accountData.dataRecuperacao || ''} onChange={e => updateField('dataRecuperacao', e.target.value)} icon={Calendar} />
            </div>
            <Textarea label="OBSERVAÇÕES & TAGS" value={accountData.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Anotações sobre o ID..." />

            <div className="flex gap-4 pt-10 sticky bottom-0 bg-background-modal py-4 border-t border-border/50 z-20">
              <Button onClick={handleSave} className="flex-1 py-4 text-xs font-black uppercase italic tracking-widest shadow-glow-primary">SALVAR DADOS</Button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-text-tertiary hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">CANCELAR</button>
            </div>
          </div>

          {/* LADO DIREITO: RESUMO DO ID (DINÂMICO) */}
          <div className="w-full lg:w-[320px] shrink-0 sticky top-0 h-fit animate-in slide-up">
            <div className="bg-background-tertiary/40 border border-border rounded-modal p-6 space-y-4 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
               <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-3">
                 <AlertCircle className="text-primary" size={18} />
                 <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">RESUMO DO ID</h3>
               </div>
               
               <div className="space-y-0.5">
                 <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">IS ATIVO</p>
                 <p className="text-xs font-bold text-white italic truncate">{accountData.customerId || 'Aguardando preenchimento...'}</p>
               </div>

               <div className="grid grid-cols-2 gap-4 border-t border-border/10 pt-2">
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">CONTA</p>
                   <p className="text-[10px] text-text-secondary truncate">{accountData.customerId || 'N/A'}</p>
                 </div>
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">EMAIL</p>
                   <p className="text-[10px] text-text-secondary truncate">{accountData.email || 'N/A'}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 border-t border-border/10 pt-2">
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">PROXY</p>
                   <p className="text-[10px] text-text-secondary truncate font-mono">{accountData.proxy || 'N/A'}</p>
                 </div>
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">DOMINIO</p>
                   <p className="text-[10px] text-text-secondary truncate">{accountData.domain || 'N/A'}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 border-t border-border/10 pt-2">
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">BANCO</p>
                   <p className="text-[10px] text-text-secondary truncate">{accountData.cardBank || 'N/A'}</p>
                 </div>
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">TITULAR</p>
                   <p className="text-[10px] text-text-secondary truncate">{accountData.cardHolderName || 'N/A'}</p>
                 </div>
               </div>

               <div className="space-y-1 pt-2 border-t border-border/30">
                 <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">INVESTIDO</p>
                 <p className="text-2xl font-black text-success shadow-glow-success-muted">R$ {totalInvestido.toFixed(2)}</p>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10">
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">STATUS</p>
                   <Badge status={accountData.status || 'ATIVA'}>{accountData.status}</Badge>
                 </div>
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">TIPO</p>
                   <p className="text-[10px] font-bold text-white uppercase italic">{accountData.tipoConta || 'FARMADA'}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10">
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">TIER</p>
                   <Badge status={accountData.tier || 'T1'}>{accountData.tier}</Badge>
                 </div>
                 <div className="space-y-0.5">
                   <p className="text-[9px] text-primary uppercase font-bold tracking-widest flex items-center gap-1"><UserCheck size={10} /> OPERADOR</p>
                   <p className="text-[10px] font-bold text-white uppercase italic">SISTEMA</p>
                 </div>
               </div>

               {/* SEÇÃO DINÂMICA: MODELO DE SCRIPT */}
               {selectedScriptName && (
                 <div className="space-y-2 pt-3 border-t border-border/10">
                    <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">📋 MODELO DE SCRIPT</p>
                    <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
                       <p className="text-[10px] font-bold text-white uppercase italic flex items-center gap-2"><FileCode size={12} className="text-primary"/> {selectedScriptName}</p>
                    </div>
                 </div>
               )}

               {/* SEÇÃO DINÂMICA: MOTIVOS DE BLOQUEIO */}
               {accountData.blockReasons && accountData.blockReasons.length > 0 && (
                 <div className="space-y-2 pt-3 border-t border-border/10">
                    <p className="text-[9px] text-danger uppercase font-bold tracking-widest">🚫 MOTIVOS DE BLOQUEIO</p>
                    <div className="flex flex-col gap-1.5">
                       {accountData.blockReasons.map(r => (
                         <div key={r.id} className="p-2 bg-danger/5 border border-danger/10 rounded text-[9px] text-danger-alt font-medium leading-tight flex items-start gap-2">
                           <span className="mt-0.5">•</span>
                           <span><span className="font-black">{r.categoria}:</span> {r.motivo}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* SEÇÃO DINÂMICA: DATAS (COLORIDAS) */}
               {(accountData.dataContestacao || accountData.dataAtivacao || accountData.dataRecuperacao) && (
                 <div className="pt-3 border-t border-border/10 space-y-2">
                    <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest flex items-center gap-1"><Calendar size={10}/> HISTÓRICO DE DATAS</p>
                    <div className="flex flex-col gap-2">
                       {accountData.dataContestacao && (
                         <div className="flex justify-between items-center bg-warning/5 p-2 rounded border border-warning/10">
                            <span className="text-[8px] font-bold text-warning uppercase">CONTESTAÇÃO:</span>
                            <span className="text-[10px] font-bold text-white font-mono">{formatDate(accountData.dataContestacao)}</span>
                         </div>
                       )}
                       {accountData.dataAtivacao && (
                         <div className="flex justify-between items-center bg-success/5 p-2 rounded border border-success/10">
                            <span className="text-[8px] font-bold text-success uppercase">ATIVAÇÃO:</span>
                            <span className="text-[10px] font-bold text-white font-mono">{formatDate(accountData.dataAtivacao)}</span>
                         </div>
                       )}
                       {accountData.dataRecuperacao && (
                         <div className="flex justify-between items-center bg-primary/5 p-2 rounded border border-primary/10">
                            <span className="text-[8px] font-bold text-primary uppercase">RECUPERAÇÃO:</span>
                            <span className="text-[10px] font-bold text-white font-mono">{formatDate(accountData.dataRecuperacao)}</span>
                         </div>
                       )}
                    </div>
                 </div>
               )}

               <div className="pt-4 border-t border-border/30 space-y-2">
                  <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">VERIFICAÇÕES</p>
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-2 text-[10px] font-bold p-2 rounded transition-colors ${accountData.advertiserVerified ? 'bg-success/5 text-success' : 'bg-background-tertiary/20 text-text-muted opacity-40'}`}>
                      {accountData.advertiserVerified ? <CheckCircle size={14}/> : <X size={14}/>}
                      ANUNCIANTE GOOGLE
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-bold p-2 rounded transition-colors ${accountData.verificacaoG2 ? 'bg-success/5 text-success' : 'bg-background-tertiary/20 text-text-muted opacity-40'}`}>
                      {accountData.verificacaoG2 ? <ShieldCheck size={14}/> : <X size={14}/>}
                      VERIFICAÇÃO G2
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1F2937; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #374151; }
        .shadow-glow-success-muted { text-shadow: 0 0 10px rgba(0, 255, 136, 0.4); }
      `}</style>
    </div>
  );
};

export default Accounts;
