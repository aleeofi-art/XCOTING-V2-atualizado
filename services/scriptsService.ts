import { supabase } from '../lib/supabase';
import { Script, ScriptSection } from '../types';
import { SCRIPT_TEMPLATES, TemplateKey } from './scriptsTemplates';
import { sanitizeUUID } from '../utils/dbSanitize';

export const scriptsService = {
  async getAll(): Promise<Script[]> {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(s => ({
      id: s.id,
      title: s.title,
      category: s.category,
      tipoScript: s.tipo,
      sections: s.questions || [], // O banco usa 'questions', o app usa 'sections'
      content: s.content || '', 
      successRate: s.success_rate || 0,
      usageCount: s.usage_count || 0,
      rejectionCount: s.rejection_count || 0,
      createdAt: s.created_at
    }));
  },

  async create(title: string, templateKey: TemplateKey, customContent?: string): Promise<Script> {
    const template = SCRIPT_TEMPLATES[templateKey];
    
    const sections: ScriptSection[] = template.sections.map(sec => ({
      ...sec,
      id: crypto.randomUUID(),
      fields: (sec.fields || []).map(f => ({ ...f, id: crypto.randomUUID() }))
    }));

    const newScriptId = crypto.randomUUID();
    const finalContent = customContent || template.defaultContent;

    const { error } = await supabase
      .from('scripts')
      .insert({
        id: newScriptId,
        title: title.toUpperCase(),
        category: template.category,
        tipo: template.tipoScript,
        questions: sections,
        content: finalContent,
        success_rate: 0,
        usage_count: 0,
        rejection_count: 0,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return {
      id: newScriptId,
      title: title.toUpperCase(),
      category: template.category,
      tipoScript: template.tipoScript,
      content: finalContent,
      successRate: 0,
      usageCount: 0,
      rejectionCount: 0,
      sections: sections,
      createdAt: new Date().toISOString()
    };
  },

  async updateSections(id: string, sections: ScriptSection[]): Promise<void> {
    const { error } = await supabase
      .from('scripts')
      .update({ questions: sections }) // No banco a coluna se chama 'questions'
      .eq('id', sanitizeUUID(id));
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('scripts').delete().eq('id', sanitizeUUID(id));
    if (error) throw error;
  },

  async duplicate(script: Script): Promise<Script> {
    const newScriptId = crypto.randomUUID();
    const newScript = {
      ...script,
      id: newScriptId,
      title: `${script.title} (CÓPIA)`,
      usageCount: 0,
      rejectionCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('scripts').insert({
        id: newScript.id,
        title: newScript.title,
        category: newScript.category,
        tipo: newScript.tipoScript,
        questions: newScript.sections,
        content: newScript.content,
        success_rate: 0,
        usage_count: 0,
        rejection_count: 0,
        created_at: newScript.createdAt
    });

    if (error) throw error;
    return newScript;
  }
};