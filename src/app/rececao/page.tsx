"use client";

import { useState } from "react";
import MasterDetailRow from "@/components/shared/MasterDetailRow";
import { Search, PackageCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_RECEIPTS = [
  { id: "3", orderNumber: "PP26001128", equipment: "Camião Volvo FMX", requester: "Pedro Costa", priority: "Urgente" as const, date: "2026-03-19", status: "Em Trânsito/Compra" },
];

const MOCK_LINES = [
  { code: "ART-103", desc: "Fluido Travões 5L", requestedQty: 10, receivedQty: 0, pendingQty: 10 },
];

export default function ReceptionPage() {
  const [receivedValues, setReceivedValues] = useState<Record<string, number>>({});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center items-center">
        <h1 className="text-3xl font-bold tracking-tight">Receção de Artigos (Goods In)</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Conferência de material recebido contra a Nota de Encomenda (PO).
        </p>
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
          {MOCK_RECEIPTS.map((order) => (
            <MasterDetailRow 
              key={order.id} 
              order={order}
            >
              <div className="overflow-x-auto p-4 space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-400 text-xs border border-blue-100 dark:border-blue-900/40">
                  <AlertCircle className="h-4 w-4" />
                  <span>Introduza a quantidade recebida. Entregas parciais atualizarão automaticamente o pendente (Backorder).</span>
                </div>

                <div className="border dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Artigo</th>
                        <th className="px-4 py-2 font-semibold">Descrição</th>
                        <th className="px-4 py-2 font-semibold w-24 text-center">Qt. Total</th>
                        <th className="px-4 py-2 font-semibold w-24 text-center">Qt. Pendente</th>
                        <th className="px-4 py-2 font-semibold w-32 text-center">Receber Agora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800">
                      {MOCK_LINES.map((line, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 font-mono">{line.code}</td>
                          <td className="px-4 py-2">{line.desc}</td>
                          <td className="px-4 py-2 text-center text-zinc-500 font-medium">{line.requestedQty}</td>
                          <td className="px-4 py-2 text-center text-amber-600 font-bold">{line.pendingQty}</td>
                          <td className="px-4 py-2">
                             <input 
                              type="number" 
                              max={line.pendingQty}
                              min={0}
                              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded px-2 py-1 text-xs text-center font-bold"
                              value={receivedValues[line.code] || 0}
                              onChange={(e) => setReceivedValues({...receivedValues, [line.code]: parseInt(e.target.value) || 0})}
                             />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20">
                    <PackageCheck className="h-4 w-4" />
                    Finalizar Conferência
                  </button>
                </div>
              </div>
            </MasterDetailRow>
          ))}
        </div>
      </div>
    </div>
  );
}
