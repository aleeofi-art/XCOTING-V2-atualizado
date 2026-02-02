
import React, { useMemo, useEffect, useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Trophy, Activity, AlertOctagon, TrendingDown, CheckCircle, Trophy as TrophyIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useShallow } from 'zustand/react/shallow';
import { MetricWidget, Card, Badge } from '../components/ui';
import { useAppStore, selectDashboardMetrics } from '../store';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const metrics = useAppStore(useShallow(selectDashboardMetrics));
  const { profiles } = useAppStore(useShallow(state => ({ profiles: state?.profiles || [] })));
  const [avgRecoveryTime, setAvgRecoveryTime] = useState<string>('0');

  useEffect(() => {
    let isMounted = true;
    const fetchAvgRecovery = async () => {
      try {
        const { data } = await supabase
          .from('suspensions')
          .select('detected_at, resolved_at')
          .eq('status', 'recovered')
          .not('resolved_at', 'is', null);

        if (data && data.length > 0 && isMounted) {
          const totalHours = data.reduce((acc, curr) => {
            if (!curr.resolved_at || !curr.detected_at) return acc;
            const diff = new Date(curr.resolved_at).getTime() - new Date(curr.detected_at).getTime();
            return acc + (diff / (1000 * 60 * 60));
          }, 0);
          setAvgRecoveryTime((totalHours / data.length).toFixed(1));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAvgRecovery();
    return () => { isMounted = false; };
  }, []);

  const chartData = useMemo(() => {
    const active = metrics?.activeIds ?? 0;
    const recovered = metrics?.recoveredIds ?? 0;
    const contested = metrics?.totalContested ?? 0;

    return [
      { time: '00h', active: Math.max(0, active - 2), recovered: Math.max(0, recovered - 1), contested: Math.max(0, contested - 3) },
      { time: '08h', active: Math.max(0, active - 1), recovered: Math.max(0, recovered), contested: Math.max(0, contested - 1) },
      { time: '12h', active: active, recovered: recovered, contested: contested },
      { time: '18h', active: active, recovered: recovered, contested: contested },
    ];
  }, [metrics?.activeIds, metrics?.recoveredIds, metrics?.totalContested]);

  const highRiskCount = useMemo(() => {
    return (profiles || []).reduce((acc, p) => {
      const riskAccounts = (p?.accounts || []).filter(a => a && (a?.suspension_count || 0) >= 3 && a?.status === 'ATIVA');
      return acc + riskAccounts.length;
    }, 0);
  }, [profiles]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <Badge status="LIVE" />
          <h2 className="text-3xl font-bold text-white mt-2 uppercase tracking-tight italic">PAINEL DE CONTROLE</h2>
          <p className="text-text-secondary text-sm italic">Monitoramento inteligente da contingência.</p>
        </div>
      </div>

      {/* Ajustado de xl:grid-cols-6 para xl:grid-cols-3 para melhor proporção de largura */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricWidget title="IDS ATIVOS" value={metrics?.activeIds ?? 0} subtext={<span className="text-warning font-bold uppercase">{metrics?.contestedToday ?? 0} contestadas hoje</span>} icon={CheckCircle} color="text-success" />
        <MetricWidget title="RECUPERADOS" value={metrics?.recoveredIds ?? 0} subtext={<span className="font-bold">Média recovery: {avgRecoveryTime || '0'}h</span>} icon={ShieldCheck} color="text-recuperada" />
        <MetricWidget title="TOTAL CONTESTADO" value={metrics?.totalContested ?? 0} icon={AlertTriangle} color="text-contestada" />
        <MetricWidget title="TAXA APROVAÇÃO" value={`${metrics?.globalApprovalRate ?? 84}%`} icon={Activity} color="text-primary" />
        <MetricWidget title="MELHOR SCRIPT" value={`${metrics?.bestScriptVal ?? 0}%`} subtext={metrics?.bestScriptName || 'N/A'} icon={TrophyIcon} color="text-success" />
        <MetricWidget title="PIOR SCRIPT" value={`${metrics?.worstScriptVal ?? 0}%`} subtext={metrics?.worstScriptName || 'N/A'} icon={TrendingDown} color="text-danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-[400px] min-w-0">
          <h3 className="text-xl font-bold text-white mb-6 uppercase italic tracking-tight">FLUXO OPERACIONAL</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6B7280" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0D1117', border: 'none', borderRadius: '8px', color: '#FFF' }} />
                <Line type="monotone" dataKey="active" stroke="#00FF88" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="recovered" stroke="#3B82F6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="contested" stroke="#FF6B00" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className={highRiskCount > 0 ? "border-danger ring-1 ring-danger/30 min-w-0" : "min-w-0"}>
          <div className="flex items-center gap-2 mb-6">
            <AlertOctagon className={highRiskCount > 0 ? "text-danger animate-pulse" : "text-warning"} size={20} />
            <h3 className="text-lg font-bold uppercase italic tracking-tight">RADAR DE RISCO</h3>
          </div>
          <div className="space-y-4">
            {highRiskCount > 0 ? (
              <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl">
                 <p className="text-xs font-bold text-danger uppercase mb-1">ALERTA CRÍTICO</p>
                 <p className="text-sm font-bold text-white">⚠️ {highRiskCount} contas em risco alto</p>
              </div>
            ) : (
              <div className="p-4 bg-success/10 border border-success/30 rounded-xl">
                 <p className="text-xs font-bold text-success uppercase mb-1">SITUAÇÃO NORMAL</p>
                 <p className="text-sm font-bold text-white">Nenhum risco detectado.</p>
              </div>
            )}
            <div className="pt-4 border-t border-border space-y-2">
               <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Previsão Semanal</p>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Risco de Queda:</span>
                  <span className="text-warning font-bold">MÉDIO</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Performance:</span>
                  <span className="text-success font-bold">+12.4%</span>
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
