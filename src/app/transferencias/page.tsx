"use client";

import { useState } from "react";
import MasterDetailRow from "@/components/shared/MasterDetailRow";
import { Search, Truck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_TRANSFERS = [
  { id: "1", orderNumber: "PP26001126", equipment: "Escavadora CAT 320", requester: "João Silva", priority: "Emergência" as const, date: "2026-03-20", status: "Aguardando Transferência" },
];

const MOCK_LINES = [
  { code: "ART-101", desc: "Filtro de Óleo", qty: 2, unit: "UN", trs_doc: "" },
];

export default function TransfersPage() {
  const [trsDocs, setTrsDocs] = useState<Record<string, string>>({});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center items-center">
        <h1 className="text-3xl font-bold tracking-tight">Transferências Internas</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Fila de saída do Armazém Central. Registe o documento TRS para concluir a transferência.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border dark:border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Omnisearch: Pedido, Artigo, TRS..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-zinc-800 text-sm"
          />
        </div>
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
          {MOCK_TRANSFERS.map((order) => (
            <MasterDetailRow 
              key={order.id} 
              order={order}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Cód. Artigo</th>
                      <th className="px-4 py-2 font-semibold">Descrição</th>
                      <th className="px-4 py-2 font-semibold w-16 text-center">Qt.</th>
                      <th className="px-4 py-2 font-semibold w-48 text-center">Documento TRS</th>
                      <th className="px-4 py-2 font-semibold text-right w-16">Acão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800">
                    {MOCK_LINES.map((line, idx) => (
                      <tr key={idx} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30">
                        <td className="px-4 py-2 font-mono">{line.code}</td>
                        <td className="px-4 py-2 font-medium">{line.desc}</td>
                        <td className="px-4 py-2 text-center">{line.qty}</td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            placeholder="Ex: TRS-2026-001"
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded px-2 py-1 text-xs font-mono text-center"
                            value={trsDocs[line.code] || ""}
                            onChange={(e) => setTrsDocs({...trsDocs, [line.code]: e.target.value})}
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                           <button 
                            disabled={!trsDocs[line.code]}
                            className={cn(
                              "p-1.5 rounded-md transition-all",
                              trsDocs[line.code] ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50" : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                            )}
                           >
                            <Truck className="h-4 w-4" />
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
    </div>
  );
}
