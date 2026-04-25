"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Loader2, ExternalLink, ClipboardList } from "lucide-react";
import RequisitionFormModal from "./RequisitionFormModal";
import { getOrders } from "@/app/requisicao/actions";
import { cn } from "@/lib/utils";

interface RequisitionListClientProps {
  initialOrders: any[];
  initialEquipment: any[];
  initialItems: any[];
  userDelegations: any[];
  currentUserName: string;
}

const STATUS_COLORS: Record<string, string> = {
  "Submetido": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50",
  "Validado": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50",
  "Aprovado": "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50",
  "Em Compra": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50",
  "Recebido": "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-900/50",
  "Rejeitado": "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50",
};

const PRIORITY_COLORS: Record<string, string> = {
  "Normal": "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  "Urgente": "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50",
  "Emergência": "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50",
};

export default function RequisitionListClient({ initialOrders, initialEquipment, initialItems, userDelegations, currentUserName }: RequisitionListClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchId, setSearchId] = useState("");
  const [searchEquipment, setSearchEquipment] = useState("");
  const [searchPriority, setSearchPriority] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchDelegation, setSearchDelegation] = useState("");
  const [searchRequester, setSearchRequester] = useState("");

  // Sync with server data on mount
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Reload orders from server action (same pattern as delegações/usuarios)
  async function reloadOrders() {
    setLoading(true);
    try {
      const freshData = await getOrders();
      setOrders(freshData);
    } catch (err) {
      console.error("Failed to reload orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const clearAll = () => {
    setSearchId("");
    setSearchEquipment("");
    setSearchPriority("");
    setSearchStatus("");
    setSearchDate("");
    setSearchDelegation("");
    setSearchRequester("");
  };

  const filteredOrders = orders.filter(order => {
    const matchId = !searchId ||
      (order.order_number || order.id)?.toString().toLowerCase().includes(searchId.toLowerCase());

    const matchEquipment = !searchEquipment ||
      order.equipment_display?.toLowerCase().includes(searchEquipment.toLowerCase()) ||
      order.equipment_brand?.toLowerCase().includes(searchEquipment.toLowerCase()) ||
      order.equipment_model?.toLowerCase().includes(searchEquipment.toLowerCase());

    const matchPriority = !searchPriority ||
      order.priority?.toLowerCase().includes(searchPriority.toLowerCase());

    const matchStatus = !searchStatus ||
      order.status?.toLowerCase().includes(searchStatus.toLowerCase());

    const matchDate = !searchDate ||
      new Date(order.created_at).toLocaleDateString("pt-PT").includes(searchDate);

    const matchDelegation = !searchDelegation ||
      order.delegation_name?.toLowerCase().includes(searchDelegation.toLowerCase());

    const matchRequester = !searchRequester ||
      order.requester_name?.toLowerCase().includes(searchRequester.toLowerCase());

    return matchId && matchEquipment && matchPriority && matchStatus && matchDate && matchDelegation && matchRequester;
  });

  const searchInputCls = "w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all text-[11px] font-bold uppercase shadow-sm";

  const handleModalClose = async (success?: boolean) => {
    setIsModalOpen(false);
    setEditingOrder(null);
    if (success) {
      await reloadOrders();
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-8 bg-white dark:bg-zinc-950 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col pt-3 pb-6 overflow-hidden">

        <header className="px-6 mb-4 flex-shrink-0">
          <h1 className="text-[2.5rem] font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100 leading-none">Requisições</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-0.5">Gestão de Pedidos de Material</p>
        </header>

        {/* Search Row */}
        <div className="px-6 flex items-end gap-2 mb-4 flex-shrink-0 flex-wrap">
          {[
            { label: "Nº Pedido", value: searchId, set: setSearchId, placeholder: "ID..." },
            { label: "Delegação", value: searchDelegation, set: setSearchDelegation, placeholder: "Delegação..." },
            { label: "Requisitante", value: searchRequester, set: setSearchRequester, placeholder: "Nome..." },
            { label: "Equipamento", value: searchEquipment, set: setSearchEquipment, placeholder: "Equipamento..." },
            { label: "Prioridade", value: searchPriority, set: setSearchPriority, placeholder: "Prioridade..." },
            { label: "Estado", value: searchStatus, set: setSearchStatus, placeholder: "Estado..." },
            { label: "Data", value: searchDate, set: setSearchDate, placeholder: "DD/MM/AAAA..." },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="flex-1 min-w-[120px] space-y-1">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest pl-1">{label}</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                <input type="text" placeholder={placeholder} className={searchInputCls}
                  value={value}
                  onChange={e => set(e.target.value)} />
              </div>
            </div>
          ))}
          <div className="flex gap-2 pb-0.5">
            <button onClick={clearAll} className="p-2.5 bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20" title="Limpar filtros">
              <X className="h-4 w-4 text-white stroke-[4]" />
            </button>
            <button
              onClick={() => { setEditingOrder(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova Requisição
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/40 bg-white dark:bg-zinc-900 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10 shadow-[0_2px_0_0_rgba(228,228,231,1)] dark:shadow-[0_2px_0_0_rgba(39,39,42,1)]">
                <tr className="text-[9px] uppercase font-black text-zinc-600 dark:text-zinc-400 tracking-[0.2em]">
                  <th className="px-8 py-2 text-center">Nº Pedido</th>
                  <th className="px-8 py-2">Delegação / Requisitante</th>
                  <th className="px-8 py-2">Equipamento</th>
                  <th className="px-8 py-2 text-center">Artigos</th>
                  <th className="px-8 py-2 text-center">Prioridade</th>
                  <th className="px-8 py-2 text-center">Estado</th>
                  <th className="px-8 py-2">Data</th>
                  <th className="px-8 py-2 text-center">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-zinc-100 dark:border-zinc-800">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group cursor-pointer"
                    onDoubleClick={() => { setEditingOrder(order); setIsModalOpen(true); }}
                  >
                    <td className="px-8 py-2 align-top text-center">
                      <span className="font-mono font-black text-blue-600 dark:text-blue-500 text-[14px] tracking-[0.15em] leading-none">
                        {order.order_number || order.id?.slice(0, 8)?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-2 align-top">
                      <div className="space-y-0.5">
                        <span className="text-zinc-900 dark:text-white font-black uppercase text-[11px] tracking-widest leading-none block">
                          {order.delegation_name || "—"}
                        </span>
                        <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 leading-tight">
                          {order.requester_name || "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-2 align-top">
                      <div className="space-y-0.5">
                        <span className="text-zinc-900 dark:text-white font-black uppercase text-[11px] tracking-widest leading-none block">
                          {order.equipment_display}
                        </span>
                        {(order.equipment_brand || order.equipment_model) && (
                          <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 leading-tight">
                            {[order.equipment_brand, order.equipment_model].filter(Boolean).join(" ")}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-2 align-top text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ClipboardList className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-black text-[12px] text-zinc-700 dark:text-zinc-300">{order.lines_count}</span>
                      </div>
                      {order.lines_count > 0 && (
                        <p className="text-[8px] font-bold text-zinc-400 uppercase mt-0.5 truncate max-w-[120px] mx-auto">
                          {order.lines[0]?.item_name?.split(" — ")[0]}
                          {order.lines_count > 1 && ` +${order.lines_count - 1}`}
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-2 align-top text-center">
                      <span className={cn(
                        "inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                        PRIORITY_COLORS[order.priority] || PRIORITY_COLORS["Normal"]
                      )}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-8 py-2 align-top text-center">
                      <span className={cn(
                        "inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                        STATUS_COLORS[order.status] || STATUS_COLORS["Submetido"]
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-2 align-top whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString("pt-PT") : "—"}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 block">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-2 align-top text-center">
                      {order.teams_link ? (
                        <a
                          href={order.teams_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex p-1.5 text-blue-500 hover:text-blue-700 hover:scale-110 transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-8 py-20 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">
                      Nenhuma requisição encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <RequisitionFormModal
          initialData={editingOrder}
          equipmentList={initialEquipment}
          itemsList={initialItems}
          userDelegations={userDelegations}
          currentUserName={currentUserName}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
