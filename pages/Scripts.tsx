
import React, { useState } from 'react';
import { 
  Shield, Zap, Copy, FileText, Trash2, Plus, Eye, Clock, 
  Sparkles, PlusCircle, X, Check, Save
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Card, Button, Input, Modal, Badge } from '../components/ui';
import { Script, ScriptSection, ScriptField } from '../types';
import { useAppStore } from '../store';
import { SCRIPT_TEMPLATES, TemplateKey } from '../services/scriptsTemplates';
import { useAuth } from '../hooks/useAuth';

const Scripts: React.FC = () => {
  const { scripts, removeScript, registerScriptExecution, addScript, updateScriptSections } = useAppStore(useShallow(s => ({ 
    scripts: s.scripts ?? [], 
    removeScript: s.removeScript, 
    registerScriptExecution: s.registerScriptExecution, 
    addScript: s.addScript,
    updateScriptSections: s.updateScriptSections
  })));

  const { user, canEdit, canDelete } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scriptTitle, setScriptTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ALL_NOTHING_R1');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [localSections, setLocalSections] = useState<ScriptSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenScript = (script: Script) => {
    setEditingScript(script);
    setLocalSections(script.sections || []);
    setIsFormModalOpen(true);
    registerScriptExecution({ scriptId: script.id, operador: user?.name || 'ADMIN', userId: user?.id, resultado: 'PENDENTE' });
  };

  const handleUpdateFieldValue = (sectionId: string, fieldId: string, newValue: string) => {
    setLocalSections(prev => prev.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        fields: sec.fields.map(f => f.id === fieldId ? { ...f, value: newValue } : f)
      };
    }));
  };

  const handleSaveForm = async () => {
    if (!editingScript) return;
    setIsSaving(true);
    try {
      await updateScriptSections(editingScript.id, localSections);
      setIsFormModalOpen(false);
      alert('Alterações salvas com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!scriptTitle) return;
    try {
      const isSystemTemplate = Object.keys(SCRIPT_TEMPLATES).includes(selectedTemplate);
      if (isSystemTemplate) {
        await addScript(scriptTitle, selectedTemplate as TemplateKey);
      } else {
        const base = scripts.find(s => s.id === selectedTemplate);
        if (base) {
          await addScript(scriptTitle, 'EM_BRANCO', base.content);
        }
      }
      setIsModalOpen(false);
      setScriptTitle('');
    } catch (err: any) { alert(err.message); }
  };

  const categories = ['FRAUDE', 'COMERCIAL', 'VERIFICACAO', 'OUTROS'];

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tight italic">TRACK SCRIPT</h2>
        {canEdit && <Button onClick={() => setIsModalOpen(true)} icon={Plus} className="shadow-glow-primary uppercase font-bold text-xs italic">CRIAR NOVO MODELO</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center p-6"><Shield size={32} className="text-success mb-2" /><span className="text-[10px] font-bold text-text-secondary uppercase">Modelos Ativos</span><span className="text-2xl font-bold">{scripts.length}</span></Card>
        <Card className="flex flex-col items-center p-6"><Zap size={32} className="text-warning mb-2" /><span className="text-[10px] font-bold text-text-secondary uppercase">Sucesso Médio</span><span className="text-2xl font-bold">84%</span></Card>
        <Card className="flex flex-col items-center p-6"><FileText size={32} className="text-primary mb-2" /><span className="text-[10px] font-bold text-text-secondary uppercase">Usos Totais</span><span className="text-2xl font-bold">{scripts.reduce((a, b) => a + (b.usageCount || 0), 0)}</span></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scripts.map((script) => (
          <Card key={script.id} className="relative flex flex-col group border-border/40 hover:border-primary/50">
            <h3 className="font-bold text-white uppercase italic mb-2 truncate pr-6">{script.title}</h3>
            <div className="flex justify-between items-center mb-4">
              <Badge status={script.category}>{script.category}</Badge>
              <button onClick={() => handleOpenScript(script)} className="text-text-tertiary hover:text-primary"><Sparkles size={14}/></button>
            </div>
            <div className="mt-4 flex-1">
               <p className="text-[9px] text-text-tertiary uppercase font-bold flex items-center gap-1"><Clock size={10} /> {script.usageCount === 0 ? 'Nunca usado' : `Último uso: ${script.lastUsed ? new Date(script.lastUsed).toLocaleDateString() : 'Hoje'}`}</p>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="secondary" size="sm" className="flex-1 text-[10px] font-bold uppercase italic" onClick={() => handleOpenScript(script)} icon={Eye}>ABRIR</Button>
              <Button variant="outline" size="sm" className="px-3 text-[10px] font-bold uppercase" onClick={() => {
                navigator.clipboard.writeText(script.content);
                alert('Copiado!');
              }} icon={Copy}>COPIAR</Button>
              {canDelete && <button onClick={() => removeScript(script.id)} className="p-2 text-text-tertiary hover:text-danger"><Trash2 size={16}/></button>}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="EXECUTAR / EDITAR SCRIPT" size="lg">
        {editingScript && (
          <div className="space-y-6 pb-20">
            <div className="border-b border-border/30 pb-4 flex justify-between items-end">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter">{editingScript.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-success font-bold uppercase flex items-center gap-1">
                    <Check size={12} className="text-success"/> SUCESSO REAL: {editingScript.successRate}%
                  </span>
                  <span className="text-[11px] text-text-tertiary font-bold uppercase">| {editingScript.usageCount} EXECUÇÕES</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-text-tertiary font-bold uppercase mb-1">CATEGORIA</p>
                <Badge status={editingScript.category}>{editingScript.category}</Badge>
              </div>
            </div>

            <div className="border border-primary/20 bg-background-primary/40 rounded-xl p-8 space-y-10 min-h-[300px]">
              {localSections.map((section) => (
                <div key={section.id} className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary"></div>
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">{section.title}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    {section.fields.map((field) => (
                      <div key={field.id} className={field.width === 'full' ? 'md:col-span-2 space-y-2' : 'space-y-2'}>
                        <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider block ml-1">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea 
                            value={field.value} 
                            onChange={(e) => handleUpdateFieldValue(section.id, field.id, e.target.value)}
                            className="w-full bg-black/40 border border-border-input/50 rounded p-3 text-xs text-white focus:border-primary/50 outline-none min-h-[100px] resize-none transition-all"
                          />
                        ) : (
                          <input 
                            value={field.value} 
                            onChange={(e) => handleUpdateFieldValue(section.id, field.id, e.target.value)}
                            className="w-full bg-black/40 border border-border-input/50 rounded px-4 py-2.5 text-xs text-white focus:border-primary/50 outline-none transition-all"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-6 items-center pt-4 border-t border-border/30">
               <button onClick={() => setIsFormModalOpen(false)} className="text-[10px] font-bold text-text-secondary hover:text-white uppercase tracking-widest px-2 transition-all">FECHAR</button>
               <button 
                onClick={handleSaveForm}
                disabled={isSaving}
                className="bg-[#6366F1] hover:bg-[#5558E3] text-white px-6 py-2.5 rounded shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-2 text-[10px] font-bold uppercase transition-all"
               >
                 <Save size={14}/> {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
               </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="CRIAR NOVO MODELO" size="lg">
        <div className="space-y-6">
           <Input label="NOME DO SCRIPT" placeholder="Ex: FRAUDE SISTEMA V3" value={scriptTitle} onChange={e => setScriptTitle(e.target.value)} />
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-text-secondary uppercase">Modelo Base</label>
             <select 
               className="w-full bg-background-primary border border-border-input rounded px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer" 
               value={selectedTemplate} 
               onChange={e => setSelectedTemplate(e.target.value)}
             >
                <optgroup label="MODELOS DE SISTEMA" className="bg-background-modal text-primary font-bold">
                  {Object.entries(SCRIPT_TEMPLATES).map(([k, v]) => <option key={k} value={k} className="bg-background-primary text-white font-normal">{v.name}</option>)}
                </optgroup>
                {categories.map(cat => {
                   const filtered = scripts.filter(s => s.category === cat);
                   if (filtered.length === 0) return null;
                   return (
                     <optgroup key={cat} label={`MEUS SCRIPTS: ${cat}`} className="bg-background-modal text-success font-bold">
                       {filtered.map(s => <option key={s.id} value={s.id} className="bg-background-primary text-white font-normal">{s.title}</option>)}
                     </optgroup>
                   );
                })}
             </select>
           </div>
           <div className="pt-6 border-t border-border">
              <Button className="w-full py-3 shadow-glow-primary font-bold uppercase italic tracking-widest" onClick={handleCreate}>CRIAR AGORA</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Scripts;
