import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Package, 
  ArrowRight,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch real KPI counts
  const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Submetido');
  const { count: approvedCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Aprovado');
  const { count: emergencyCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('priority', 'Emergência');
  const { count: receptionCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Recebido');

  // Fetch recent activity
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const KPIS = [
    { label: "Pedidos Pendentes", value: pendingCount || "0", icon: Clock, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Aguardando Aprovação", value: approvedCount || "0", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Urgências/Emergências", value: emergencyCount || "0", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", priority: true },
    { label: "Receções Hoje", value: receptionCount || "0", icon: Package, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Painel de Controlo</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Resumo operacional em tempo real - Gestão de Armazéns Omatapalo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPIS.map((kpi, idx) => (
          <div 
            key={idx} 
            className={cn(
              "p-6 rounded-2xl border bg-white dark:bg-zinc-900 transition-all hover:shadow-lg dark:border-zinc-800",
              kpi.priority && "ring-2 ring-red-500/20 border-red-200 dark:border-red-900/40"
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-2 rounded-xl", kpi.bg)}>
                <kpi.icon className={cn("h-6 w-6", kpi.color)} />
              </div>
              {kpi.priority && (
                <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full animate-pulse uppercase">Urgente</span>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{kpi.value}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Atividade Recente (Supabase)</h2>
            <Link href="/validacao" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Ver tudo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden divide-y dark:divide-zinc-800">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors",
                    item.priority === "Emergência" && "bg-red-50/50 dark:bg-red-900/5"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    item.priority === "Emergência" ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
                  )}>
                    {item.priority === "Emergência" ? <AlertTriangle className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">Pedido #{item.order_number || item.id.slice(0,8)}</h4>
                      {item.priority === "Emergência" && (
                        <span className="text-[10px] font-bold text-red-600 px-1.5 py-0.5 border border-red-200 rounded uppercase">Emergência</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{item.status} - Atualizado {new Date(item.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 italic">Nenhum pedido encontrado na base de dados.</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Notificações Inteligentes</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 flex gap-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full h-fit">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold">Ligação Concluída</p>
                <p className="text-[10px] text-zinc-500 italic">O dashboard está agora a ler dados reais do Supabase.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
