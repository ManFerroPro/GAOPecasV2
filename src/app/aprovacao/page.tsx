"use client";

import { useState } from "react";
import MasterDetailRow from "@/components/shared/MasterDetailRow";
import ActionModal from "@/components/shared/ActionModal";
import { Search, Filter, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_ORDERS = [
  { id: "1", orderNumber: "PP26001126", equipment: "Escavadora CAT 320", requester: "João Silva", priority: "Emergência" as const, date: "2026-03-20", status: "Validado" },
  { id: "3", orderNumber: "PP26001128", equipment: "Camião Volvo FMX", requester: "Pedro Costa", priority: "Urgente" as const, date: "2026-03-19", status: "Validado" },
];

const MOCK_LINES = [
  { code: "ART-101", desc: "Filtro de Óleo", qty: 2, unit: "UN" },
];

export default function ApprovalPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);

  const handleAction = (order: any, type: string) => {
    setSelectedOrder(order);
    if (type === "approve") setModalType("approve");
    if (type === "reject") setModalType("reject");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center items-center">
        <h1 className="text-3xl font-bold tracking-tight">Aprovação Central (Triagem)</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Ecrã de triagem para o Gestor Central. Decida o destino de cada linha: Transferência ou Compra.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border dark:border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-zinc-800 text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">
          <Filter className="h-4 w-4" />
          <span>Filtros Avançados</span>
        </button>
      </div>

      <div className="rounded-xl border dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 flex items-center p-3 gap-4 border-b dark:border-zinc-800">
          <div className="w-4" />
          <div className="flex-1 grid grid-cols-6 gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Pedido</span>
            <span>Equipamento</span>
            <span>Requisitante</span>
            <span>Prioridade</span>
            <span>Data</span>
            <span className="text-right">Ações</span>
          </div>
        </div>

        <div className="divide-y dark:divide-zinc-800">
          {MOCK_ORDERS.map((order) => (
            <MasterDetailRow 
              key={order.id} 
              order={order} 
              onAction={(action) => handleAction(order, action)}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Cód. Solicitado</th>
                      <th className="px-4 py-2 font-semibold">Cód. Fornecido</th>
                      <th className="px-4 py-2 font-semibold">Qt.</th>
                      <th className="px-4 py-2 font-semibold text-center">Modo</th>
                      <th className="px-4 py-2 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800">
                    {MOCK_LINES.map((line, idx) => (
                      <tr key={idx} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30">
                        <td className="px-4 py-2 font-mono">{line.code}</td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            defaultValue={line.code}
                            className="w-full max-w-[120px] bg-zinc-100 dark:bg-zinc-800 border-none rounded px-2 py-1 text-xs font-mono"
                          />
                        </td>
                        <td className="px-4 py-2">{line.qty} {line.unit}</td>
                        <td className="px-4 py-2">
                          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-0.5 w-fit mx-auto">
                            <button className="px-2 py-1 rounded text-[10px] bg-white dark:bg-zinc-700 shadow-sm font-bold">TRS</button>
                            <button className="px-2 py-1 rounded text-[10px] font-medium text-zinc-500">PO</button>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                           <button className="text-zinc-400 hover:text-blue-600 transition-colors">
                            <ArrowRight className="h-4 w-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MasterDetailRow>
          ))}
        </div>
      </div>

      <ActionModal 
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onConfirm={(data) => console.log("Final Decisao:", data)}
        title={modalType === "approve" ? "Confirmar Aprovação Central" : "Confirmar Rejeição Central"}
        type={modalType as any}
        orderNumber={selectedOrder?.orderNumber || ""}
      />
    </div>
  );
}
