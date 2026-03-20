import { 
  Search, 
  Filter,
  CheckCircle2,
  ArrowRightLeft,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import MasterDetailRow from "@/components/shared/MasterDetailRow";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function ApprovalPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch orders that are Validated (Waiting for central approval)
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      equipment:equipment_id(brand, model),
      order_lines(*)
    `)
    .eq('status', 'Validado')
    .order('priority', { ascending: false });

  const mappedOrders = orders?.map(o => ({
    id: o.id,
    orderNumber: o.order_number || o.id.slice(0, 8),
    equipment: o.equipment ? `${(o.equipment as any).brand} ${(o.equipment as any).model}` : "N/A",
    requester: "Técnico Local", 
    priority: o.priority as any,
    date: new Date(o.created_at).toLocaleDateString(),
    status: o.status,
    lines: o.order_lines || []
  })) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-500">Aprovação & Triagem</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Ponto de controlo central para Aprovação de orçamento, Transferência ou Compra.</p>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Aguardando Triagem</p>
          <p className="text-2xl font-bold">{mappedOrders.length}</p>
        </div>
      </div>

      <div className="border dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="divide-y dark:divide-zinc-800">
          {mappedOrders.length > 0 ? (
            mappedOrders.map((order) => (
              <MasterDetailRow key={order.id} order={order}>
                <div className="p-4 space-y-6">
                   <div className="overflow-x-auto">
                     <table className="w-full text-xs text-left">
                       <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                         <tr>
                           <th className="p-2">Item</th>
                           <th className="p-2">Qtd Pedida</th>
                           <th className="p-2 text-right">Decisão Central</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y dark:divide-zinc-800">
                         {order.lines.map((line: any) => (
                           <tr key={line.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                             <td className="p-2 flex flex-col italic">
                               <span className="font-bold text-zinc-700 dark:text-zinc-300">{line.item_name}</span>
                               <span className="text-[10px] text-zinc-500">{line.requested_item_code}</span>
                             </td>
                             <td className="p-2">{line.requested_qty} UN</td>
                             <td className="p-2 text-right space-x-2">
                               <button className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase transition-colors hover:bg-blue-200">
                                 Transferir
                               </button>
                               <button className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-[10px] font-bold uppercase transition-colors hover:bg-amber-200">
                                 Comprar
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              </MasterDetailRow>
            ))
          ) : (
             <p className="p-8 text-center text-zinc-500 italic">Nenhum pedido validado pendente de triagem.</p>
          )}
        </div>
      </div>
    </div>
  );
}
