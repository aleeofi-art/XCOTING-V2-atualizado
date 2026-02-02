
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, UserPlus } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos.');
        }
        throw authError;
      }

      if (data.user) {
        await useAppStore.getState().initialize();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-primary p-4 md:p-6 lg:p-8 relative overflow-hidden">
      
      {/* 1 DIV NOVA: FUNDO ANIMADO (.bg-animated) */}
      <div className="bg-animated fixed inset-0 pointer-events-none -z-1 overflow-hidden bg-background-primary">
        {/* Glow Spheres com Neon Intenso (rgba 0.60+ e box-shadow em camadas) */}
        <div className="absolute top-[-10%] left-[-5%] w-[55%] h-[55%] bg-[rgba(139,92,246,0.65)] rounded-full blur-[100px] animate-bg-float sphere-glow"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-[rgba(139,92,246,0.60)] rounded-full blur-[120px] animate-bg-float-reverse sphere-glow"></div>
        
        {/* Radar Pattern com Linhas Altamente Visíveis (rgba 0.70) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-[150%] h-[150%] animate-slow-spin-radar" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="12" stroke="rgba(139, 92, 246, 0.70)" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="24" stroke="rgba(139, 92, 246, 0.70)" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="36" stroke="rgba(139, 92, 246, 0.75)" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="48" stroke="rgba(139, 92, 246, 0.80)" strokeWidth="0.3" strokeDasharray="3 6" />
            
            {/* Radar Sweep Line */}
            <line x1="50" y1="50" x2="50" y2="0" stroke="rgba(139, 92, 246, 0.90)" strokeWidth="0.5" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
            </line>

            {/* Static Tracking Lines */}
            <g opacity="0.6">
              <line x1="50" y1="50" x2="100" y2="50" stroke="rgba(139, 92, 246, 0.70)" strokeWidth="0.1" />
              <line x1="50" y1="50" x2="0" y2="50" stroke="rgba(139, 92, 246, 0.70)" strokeWidth="0.1" />
              <line x1="50" y1="50" x2="50" y2="100" stroke="rgba(139, 92, 246, 0.70)" strokeWidth="0.1" />
            </g>

            {/* Tech Dots */}
            <circle cx="50" cy="10" r="1" fill="rgba(139, 92, 246, 0.90)" className="animate-pulse" />
            <rect x="85" y="48" width="2" height="2" fill="rgba(139, 92, 246, 0.80)" />
          </svg>
        </div>

        {/* Textura de Ruído Sutil */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[420px] flex flex-col gap-8 animate-in slide-up duration-500 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mb-4 shadow-glow-primary">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter italic uppercase">XCOTING</h1>
          <p className="text-text-secondary text-xs max-w-xs mx-auto italic">
            Proteção e Contingência para Google Ads.
          </p>
        </div>

        <Card className="p-8 border-border/50 bg-background-secondary/80 backdrop-blur-sm shadow-2xl relative overflow-hidden w-full h-auto">
           <h2 className="text-xl font-bold text-white mb-8 text-center uppercase italic tracking-tight">
             ENTRAR NO SISTEMA
           </h2>
           
           {error && (
             <div className="mb-6 p-4 border rounded-xl bg-danger/5 border-danger/20 text-danger text-xs font-bold">
               <div className="flex items-center gap-2">
                 <AlertCircle size={14} /> {error}
               </div>
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-6 w-full">
              <div className="space-y-1.5 w-full">
                 <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Email</label>
                 <Input 
                   icon={Mail} 
                   type="email" 
                   required 
                   value={email} 
                   onChange={e => setEmail(e.target.value)} 
                   placeholder="seu@email.com"
                   className="w-full"
                 />
              </div>
              
              <div className="space-y-1.5 w-full">
                 <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest">Senha</label>
                 <div className="relative w-full">
                    <Input 
                      icon={Lock} 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
              </div>

              <div className="pt-2 w-full">
                <Button 
                  type="submit" 
                  className="w-full py-4 text-xs uppercase font-black italic tracking-widest" 
                  isLoading={isLoading}
                >
                   ACESSAR DASHBOARD <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>

              <div className="text-center pt-4 space-y-4">
                <Link to="/register" className="text-xs text-primary hover:text-primary-light font-bold flex items-center justify-center gap-2 transition-colors">
                  <UserPlus size={14} /> NÃO TEM CONTA? CADASTRE-SE
                </Link>
                <p className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest opacity-50">
                  ESTRUTURA DE ACESSO PROTEGIDA
                </p>
              </div>
           </form>
        </Card>
      </div>

      <style>{`
        /* CSS NOVO SEPARADO */
        .bg-animated {
          z-index: -1;
          background-color: #0A0E1A;
        }
        .sphere-glow {
          box-shadow: 
            0 0 40px rgba(139,92,246,0.9),
            0 0 80px rgba(139,92,246,0.7),
            0 0 140px rgba(139,92,246,0.5);
        }
        @keyframes bg-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, 5%) scale(1.1); }
        }
        @keyframes bg-float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5%, -3%) scale(1.15); }
        }
        @keyframes slow-spin-radar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-bg-float {
          animation: bg-float 40s ease-in-out infinite;
        }
        .animate-bg-float-reverse {
          animation: bg-float-reverse 55s ease-in-out infinite;
        }
        .animate-slow-spin-radar {
          animation: slow-spin-radar 80s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
