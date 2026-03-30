"use client";

import { 
  Users, 
  Database, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Activity,
  History
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CONFIG_KPIS = [
  { label: "Usuários Ativos", value: "12", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { label: "Marcas / Categorias", value: "48", icon: Database, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { label: "Alertas de Acesso", value: "0", icon: AlertCircle, color: "text-zinc-400", bg: "bg-zinc-50 dark:bg-zinc-900" },
  { label: "Audit Log (Hoje)", value: "156", icon: History, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
];

export default function ConfigDashboardPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">Painel de Administração</h1>
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1 italic">Gestão centralizada de utilizadores e dados mestres.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CONFIG_KPIS.map((kpi, idx) => (
          <div 
            key={idx} 
            className="p-8 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={cn("p-4 rounded-2xl", kpi.bg)}>
                <kpi.icon className={cn("h-6 w-6", kpi.color)} />
              </div>
              <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-3xl font-black tracking-tighter">{kpi.value}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links / Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100">Próximas Tarefas</h2>
            <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/configuracoes/usuarios" className="group p-6 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-blue-600/20 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest">Revisão de Permissões</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">2 novos utilizadores aguardam role.</p>
            </Link>

            <Link href="/configuracoes/hierarquias" className="group p-6 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-emerald-600/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Database className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest">Hierarquia de Artigos</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Sincronizar famílias do ERP.</p>
            </Link>
          </div>
        </div>

        {/* Audit Log (Minimal) */}
        <div className="p-8 rounded-3xl border-2 border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center justify-between">
            Segurança Recente
            <ShieldCheck className="h-4 w-4 text-emerald-500/50" />
          </h2>
          
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 leading-tight">Tentativa de Login</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">IP: 192.168.1.45 • 10:24</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
