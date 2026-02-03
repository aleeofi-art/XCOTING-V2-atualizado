import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store';

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

    setIsSubmitting(true);
    try {
      // 1. Criar Usuário no Auth do Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { name: name } 
        }
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('confirmation email') || signUpError.message.toLowerCase().includes('smtp')) {
          setError('ERRO DE SEGURANÇA: O administrador do sistema precisa desativar a "Confirmação de E-mail" no painel do Supabase (Auth > Providers > Email > Confirm Email: OFF) para liberar novos registros sem erro.');
          setIsSubmitting(false);
          return;
        }
        throw signUpError;
      }

      if (!authData.user) throw new Error("Erro ao criar conta.");

      // 🆕 2. CRIAR UM NOVO TENANT (EMPRESA) PARA ESTE USUÁRIO
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({ 
          nome_empresa: `Empresa de ${name}` // Você pode personalizar isso
        })
        .select()
        .single();

      if (tenantError) {
        throw new Error('Erro ao criar empresa: ' + tenantError.message);
      }

      // 🆕 3. ASSOCIAR O TENANT_ID AO USUÁRIO
      const { error: updateError } = await supabase.auth.updateUser({
        data: { tenant_id: newTenant.id }
      });

      if (updateError) {
        throw new Error('Erro ao associar empresa ao usuário: ' + updateError.message);
      }

      // 🆕 4. SALVAR NO PERFIL PÚBLICO COM O TENANT_ID
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: name,
        email: email,
        role: 'operador',
        tenant_id: newTenant.id // 👈 ADICIONAR O TENANT_ID AQUI
      });

      await useAppStore.getState().initialize();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary p-4">
      <div className="w-full max-w-md space-y-8 animate-in slide-up">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-4 shadow-glow-primary">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 italic uppercase">CRIAR CONTA</h1>
          <p className="text-text-secondary text-xs italic">Cadastre-se para gerenciar sua contingência.</p>
        </div>

        <Card className="p-8 border-border/50 bg-background-secondary/80 shadow-2xl relative">
          {error && (
            <div className="mb-6 p-4 border rounded-xl bg-danger/10 border-danger/30 text-danger text-[11px] font-bold leading-relaxed animate-in zoom-in">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> 
                <span className="uppercase">{error}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-danger/20 flex items-center gap-2 opacity-80">
                <Info size={12} />
                <span>Isso é uma configuração no seu painel Supabase.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Nome Completo</label>
              <Input icon={User} required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">E-mail</label>
              <Input icon={Mail} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Senha (mín 6 caracteres)</label>
              <Input icon={Lock} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase">Confirmar Senha</label>
              <Input icon={Lock} type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <Button type="submit" className="w-full py-4 text-xs font-black uppercase italic tracking-widest" isLoading={isSubmitting}>
              CRIAR MINHA CONTA <ArrowRight size={18} className="ml-2" />
            </Button>

            <div className="text-center pt-4">
              <Link to="/login" className="text-xs text-text-secondary hover:text-white uppercase font-bold">
                JÁ TEM CONTA? FAÇA LOGIN
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
