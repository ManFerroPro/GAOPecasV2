"use client";

import { useState } from "react";
import MasterDetailRow from "@/components/shared/MasterDetailRow";
import { Search, ShoppingCart, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_PURCHASES = [
  { id: "3", orderNumber: "PP26001128", equipment: "Camião Volvo FMX", requester: "Pedro Costa", priority: "Urgente" as const, date: "2026-03-19", status: "Aguardando Compra" },
];

const MOCK_LINES = [
  { code: "ART-103", desc: "Fluido Travões 5L", qty: 2, unit: "L" },
];

export default function PurchasesPage() {
  const [purchaseInfo, setPurchaseInfo] = useState<any>({});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center items-center">
        <h1 className="text-3xl font-bold tracking-tight">Compras (Procurement)</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Fila de aquisição para Compradores. Registe cotações e prazos de entrega.
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
          {MOCK_PURCHASES.map((order) => (
            <MasterDetailRow 
              key={order.id} 
              order={order}
            >
              <div className="overflow-x-auto p-4 space-y-6 bg-zinc-50/50 dark:bg-zinc-800/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Fornecedor</label>
                    <input type="text" placeholder="Nome do Fornecedor" className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded px-3 py-1.5 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Nº Cotação</label>
                    <input type="text" placeholder="Ex: COT-999" className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded px-3 py-1.5 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Valor Total</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2 h-3 w-3 text-zinc-400" />
                      <input type="number" placeholder="0.00" className="w-full pl-6 pr-3 py-1.5 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Prazo Entrega</label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2 h-3 w-3 text-zinc-400" />
                      <input type="date" className="w-full pl-6 pr-3 py-1.5 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded text-xs" />
                    </div>
                  </div>
                </div>

                <div className="border dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Artigo</th>
                        <th className="px-4 py-2 font-semibold">Descrição</th>
                        <th className="px-4 py-2 font-semibold w-16 text-center">Qt.</th>
                        <th className="px-4 py-2 font-semibold text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800">
                      {MOCK_LINES.map((line, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 font-mono">{line.code}</td>
                          <td className="px-4 py-2">{line.desc}</td>
                          <td className="px-4 py-2 text-center">{line.qty}</td>
                          <td className="px-4 py-2 text-right">
                             <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded uppercase">Aguardando Pagamento</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button className="flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md">
                    <ShoppingCart className="h-4 w-4" />
                    Registar Compra
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
