"use client";

import { useState } from "react";
import MasterDetailRow from "@/components/shared/MasterDetailRow";
import ActionModal from "@/components/shared/ActionModal";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_ORDERS = [
  { id: "1", orderNumber: "PP26001126", equipment: "Escavadora CAT 320", requester: "João Silva", priority: "Emergência" as const, date: "2026-03-20", status: "Submetido" },
  { id: "2", orderNumber: "PP26001127", equipment: "Bulldozer D6", requester: "Maria Santos", priority: "Normal" as const, date: "2026-03-20", status: "Submetido" },
  { id: "3", orderNumber: "PP26001128", equipment: "Camião Volvo FMX", requester: "Pedro Costa", priority: "Urgente" as const, date: "2026-03-19", status: "Submetido" },
];

const MOCK_LINES = [
  { code: "ART-101", desc: "Filtro de Óleo", qty: 2, unit: "UN" },
  { code: "ART-102", desc: "Junta de Cabeça", qty: 1, unit: "UN" },
];

export default function ValidationPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);

  // Sorting: Emergência first, then Urgente, then Normal
  const sortedOrders = [...MOCK_ORDERS].sort((a, b) => {
    const weights: Record<string, number> = { "Emergência": 0, "Urgente": 1, "Normal": 2 };
    return weights[a.priority] - weights[b.priority];
  });

  const handleAction = (order: any, type: string) => {
    setSelectedOrder(order);
    if (type === "approve") setModalType("approve");
    if (type === "reject") setModalType("reject");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center items-center">
        <h1 className="text-3xl font-bold tracking-tight">Validação de Pedidos</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Ecrã de revisão para o Gestor Local. Analise e valide as linhas de cada pedido.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border dark:border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar por Pedido, Equipamento ou Requisitante..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-zinc-800 text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
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
          {sortedOrders.map((order) => (
            <MasterDetailRow 
              key={order.id} 
              order={order} 
              onAction={(action) => handleAction(order, action)}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Cód. Omatapalo</th>
                      <th className="px-4 py-2 font-semibold">Descrição</th>
                      <th className="px-4 py-2 font-semibold w-24 text-center">Qt. Pedida</th>
                      <th className="px-4 py-2 font-semibold w-16 text-center">Unid.</th>
                      <th className="px-4 py-2 font-semibold w-32 text-right">Ação Line-by-Line</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800">
                    {MOCK_LINES.map((line, idx) => (
                      <tr key={idx} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30">
                        <td className="px-4 py-2 font-mono">{line.code}</td>
                        <td className="px-4 py-2 font-medium">{line.desc}</td>
                        <td className="px-4 py-2 text-center">{line.qty}</td>
                        <td className="px-4 py-2 text-center">{line.unit}</td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button className="text-emerald-600 dark:text-emerald-400 font-bold">✅</button>
                          <button className="text-red-600 dark:text-red-400 font-bold">❌</button>
                          <button className="text-blue-600 dark:text-blue-400 font-bold">🔄</button>
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
        onConfirm={(data) => console.log("Final Decision:", data)}
        title={modalType === "approve" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
        type={modalType as any}
        orderNumber={selectedOrder?.orderNumber || ""}
      />
    </div>
  );
}
