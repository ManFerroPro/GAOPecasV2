import { 
  Search, 
  Filter,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import OrderValidationItem from "@/components/validacao/OrderValidationItem";

export default async function ValidationPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch orders that need validation (status: Submetido)
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      equipment:equipment_id(brand, model),
      order_lines(*)
    `)
    .eq('status', 'Submetido')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  const mappedOrders = orders?.map(o => ({
    id: o.id,
    orderNumber: o.order_number || o.id.slice(0, 8),
    equipment: o.equipment ? `${(o.equipment as any).brand} ${(o.equipment as any).model}` : "N/A",
    requester: "Técnico Local", 
    priority: o.priority as any,
    date: new Date(o.created_at).toLocaleDateString(),
    status: o.status,
    teamsLink: o.teams_link,
    lines: o.order_lines || []
  })) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Validação de Pedidos</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Ponto de controlo para Gestores Locais - Valide as requisições recebidas.</p>
      </header>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por pedido, equipamento ou técnico..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:border-zinc-800 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border dark:border-zinc-800 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>
        </div>
      </div>

      <div className="border dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="grid grid-cols-6 gap-4 p-4 border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
          <span>Número</span>
          <span>Equipamento</span>
          <span>Requisitante</span>
          <span>Prioridade</span>
          <span>Data</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="divide-y dark:divide-zinc-800">
          {mappedOrders.length > 0 ? (
            mappedOrders.map((order) => (
              <OrderValidationItem key={order.id} order={order}>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-4 pb-2 border-b dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase">
                    <span className="col-span-2 text-blue-600 dark:text-blue-400">Descrição do Artigo</span>
                    <span>Qtd</span>
                    <span className="text-right">Ação Line-by-Line</span>
                  </div>
                  {order.lines.map((line: any) => (
                    <div key={line.id} className="grid grid-cols-4 gap-4 items-center">
                      <div className="col-span-2 flex flex-col">
                        <span className="text-xs font-medium">{line.item_name || "Artigo sem nome"}</span>
                        {line.requested_item_code && (
                          <span className="text-[10px] font-mono text-zinc-500">{line.requested_item_code}</span>
                        )}
                      </div>
                      <span className="text-xs">{line.requested_qty} UN</span>
                      <div className="flex justify-end gap-2">
                         <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 uppercase">
                           Aguardando
                         </span>
                      </div>
                    </div>
                  ))}
                  {order.lines.length === 0 && (
                    <p className="text-xs italic text-zinc-500">Sem artigos listados.</p>
                  )}
                </div>
              </OrderValidationItem>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <ClipboardCheck className="h-10 w-10 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Tudo pronto!</h3>
                <p className="text-sm text-zinc-500">Não há novos pedidos para validar neste momento.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
