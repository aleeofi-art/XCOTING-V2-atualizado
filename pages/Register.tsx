import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { supabaseClient } from '../lib/supabaseClient';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Criar Usuário no Auth do Supabase
      const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { 
          data: { name: name } 
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) throw new Error("Erro ao criar conta.");

      // 🆕 2. CRIAR UM NOVO TENANT (EMPRESA) PARA ESTE USUÁRIO
      const { data: newTenant, error: tenantError } = await supabaseClient
        .from('tenants')
        .insert({ 
          nome_empresa: `Empresa de ${name}` 
        })
        .select()
        .single();

      if (tenantError) {
        throw new Error('Erro ao criar empresa: ' + tenantError.message);
      }

      // 🆕 3. ASSOCIAR O TENANT_ID AO USUÁRIO
      const { error: updateError } = await supabaseClient.auth.updateUser({
        data: { tenant_id: newTenant.id }
      });

      if (updateError) {
        throw new Error('Erro ao associar empresa ao usuário: ' + updateError.message);
      }

      // 🆕 4. SALVAR NO PERFIL PÚBLICO COM O TENANT_ID
      await supabaseClient.from('perfis').upsert({
        id: authData.user.id,
        email: email,
        full_name: name,
        tenant_id: newTenant.id,
        nome_do_plano: 'Starter',
        limite_de_contas: 10,
        limite_de_equipe: 0
      });

      // Salvar user no localStorage
      localStorage.setItem('xcoting_user', JSON.stringify(authData.user));
      
      // Redirecionar
      navigate('/');
    } catch (err: any) {
      console.error('Erro no registro:', err);
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-4">
      <div className="w-full max-w-md space-y-8 animate-in slide-up">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">CRIAR CONTA</h1>
          <p className="text-slate-400 text-xs">Cadastre-se para gerenciar sua contingência.</p>
        </div>

        <div className="bg-brand-surface/80 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 border rounded-xl bg-red-500/10 border-red-500/30 text-red-500 text-xs font-bold animate-in zoom-in">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> 
                <span className="uppercase">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="text"
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Ex: João Silva"
                  className="w-full bg-brand-background/80 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/40 transition-all placeholder:text-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="seu@email.com"
                  className="w-full bg-brand-background/80 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/40 transition-all placeholder:text-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Senha (mín 6 caracteres)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full bg-brand-background/80 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/40 transition-all placeholder:text-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Confirmar Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full bg-brand-background/80 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/40 transition-all placeholder:text-slate-700 font-bold"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  CRIANDO CONTA...
                </>
              ) : (
                <>
                  CRIAR MINHA CONTA <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <Link to="/auth" className="text-xs text-slate-500 hover:text-white uppercase font-bold transition-colors">
                JÁ TEM CONTA? FAÇA LOGIN
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
