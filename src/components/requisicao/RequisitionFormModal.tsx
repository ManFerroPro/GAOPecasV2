"use client";

import { useState } from "react";
import { X, Loader2, Edit2, Trash2, Search, Plus, Trash, Info, ClipboardList } from "lucide-react";
import { createOrder, deleteOrder, updateOrderStatus } from "@/app/requisicao/actions";
import { cn } from "@/lib/utils";

interface RequisitionFormModalProps {
  initialData?: any;
  equipmentList: any[];
  itemsList: any[];
  onClose: (success?: boolean) => void;
}

const STATUSES = ["Submetido", "Validado", "Aprovado", "Em Compra", "Recebido", "Rejeitado"];

export default function RequisitionFormModal({ initialData, equipmentList, itemsList, onClose }: RequisitionFormModalProps) {
  const isNew = !initialData;
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedEquipmentId, setSelectedEquipmentId] = useState(initialData?.equipment_id || "");
  const [priority, setPriority] = useState(initialData?.priority || "Normal");
  const [teamsLink, setTeamsLink] = useState(initialData?.teams_link || "");
  const [status, setStatus] = useState(initialData?.status || "Submetido");

  // Article lines management
  const [orderLines, setOrderLines] = useState<{ omatapalo_code: string; description: string; requestedQty: number; unit: string }[]>(
    initialData?.lines?.map((l: any) => {
      const parts = l.item_name?.split(" — ") || [];
      return {
        omatapalo_code: parts[0] || l.item_name,
        description: parts.slice(1).join(" — ") || l.item_name,
        requestedQty: l.requested_qty || 1,
        unit: "UN",
      };
    }) || []
  );

  // Item search
  const [itemQuery, setItemQuery] = useState("");
  const filteredItems = itemQuery.length > 0
    ? itemsList.filter(item =>
        item.omatapalo_code.toLowerCase().includes(itemQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(itemQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const selectedEquipment = equipmentList.find(eq => eq.id === selectedEquipmentId || eq.mobile_id === selectedEquipmentId);

  const addItem = (item: any) => {
    if (orderLines.find(l => l.omatapalo_code === item.omatapalo_code)) return;
    setOrderLines([...orderLines, {
      omatapalo_code: item.omatapalo_code,
      description: item.description,
      requestedQty: 1,
      unit: item.unit || "UN",
    }]);
    setItemQuery("");
  };

  const removeItem = (code: string) => {
    setOrderLines(orderLines.filter(l => l.omatapalo_code !== code));
  };

  const updateItemQty = (code: string, qty: number) => {
    setOrderLines(orderLines.map(l => l.omatapalo_code === code ? { ...l, requestedQty: qty } : l));
  };

  const handleSubmit = async () => {
    if (!selectedEquipmentId || orderLines.length === 0) return;
    setIsSubmitting(true);
    try {
      if (isNew) {
        await createOrder({
          equipmentId: selectedEquipmentId,
          priority,
          items: orderLines,
          teamsLink,
        });
        alert("Requisição criada com sucesso!");
      } else {
        // For existing orders, update status
        await updateOrderStatus(initialData.id, status);
        alert("Requisição atualizada com sucesso!");
      }
      onClose(true);
    } catch (error) {
      alert("Erro ao guardar: " + (error as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAction = async () => {
    if (!initialData?.id) return;
    if (!confirm("Tem a certeza que deseja eliminar esta requisição?")) return;
    setIsSubmitting(true);
    try {
      await deleteOrder(initialData.id);
      onClose(true);
    } catch {
      alert("Erro ao eliminar a requisição.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase disabled:opacity-50";
  const selectCls = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase disabled:opacity-50 cursor-pointer";
  const labelCls = "text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1";

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-4xl flex flex-col overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center gap-6">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
              {isNew
                ? "NOVA REQUISIÇÃO"
                : <>PEDIDO: <span className="text-blue-600">{initialData.order_number || initialData.id?.slice(0, 8)?.toUpperCase()}</span></>}
            </h3>
            {!isEditing && !isNew && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-widest">
                  <Edit2 className="h-3.5 w-3.5" /> Editar
                </button>
                <button type="button" onClick={handleDeleteAction} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-[10px] font-black uppercase tracking-widest">
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </div>
            )}
          </div>
          <button type="button" onClick={() => onClose()} className="p-3 bg-white dark:bg-zinc-800 rounded-full hover:scale-110 transition-all border border-zinc-100 dark:border-zinc-700">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 flex flex-col gap-5 overflow-y-auto flex-1">

          {/* Row 1: Equipamento */}
          <div className="space-y-1.5">
            <label className={labelCls}>Equipamento *</label>
            <select
              disabled={!isEditing}
              className={selectCls}
              value={selectedEquipmentId}
              onChange={e => setSelectedEquipmentId(e.target.value)}
            >
              <option value="">— SELECIONAR EQUIPAMENTO —</option>
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.display || `${eq.mobile_id} — ${eq.brand} ${eq.model}`}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment observations */}
          {selectedEquipment?.observations && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/40">
              <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-orange-800 dark:text-orange-200 uppercase tracking-widest">Observações do Equipamento:</p>
                <p className="text-[11px] font-bold text-orange-700 dark:text-orange-300 mt-0.5">{selectedEquipment.observations}</p>
              </div>
            </div>
          )}

          {/* Row 2: Prioridade + Status + Teams */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Prioridade</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["Normal", "Urgente", "Emergência"].map(p => (
                  <button
                    key={p}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl border-2 transition-all disabled:opacity-50",
                      priority === p
                        ? p === "Emergência"
                          ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/20"
                          : p === "Urgente"
                            ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-950"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {!isNew && (
              <div className="space-y-1.5">
                <label className={labelCls}>Estado</label>
                <select
                  disabled={!isEditing}
                  className={selectCls}
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={cn("space-y-1.5", isNew && "col-span-2")}>
              <label className={labelCls}>Teams / Smart Link</label>
              <input
                disabled={!isEditing}
                type="url"
                placeholder="https://teams.microsoft.com/..."
                className={inputCls + " normal-case"}
                value={teamsLink}
                onChange={e => setTeamsLink(e.target.value)}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[2px] bg-zinc-100 dark:bg-zinc-800" />
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5" />
              Artigos do Pedido
            </span>
            <div className="flex-1 h-[2px] bg-zinc-100 dark:bg-zinc-800" />
          </div>

          {/* Item search (only in edit mode and for new orders) */}
          {isEditing && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                <input
                  type="text"
                  placeholder="PESQUISAR ARTIGO (CÓDIGO OU DESCRIÇÃO)..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-blue-600/30 transition-all text-[11px] font-bold uppercase"
                  value={itemQuery}
                  onChange={e => setItemQuery(e.target.value)}
                />
              </div>

              {filteredItems.length > 0 && (
                <div className="border-2 border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  {filteredItems.map(item => (
                    <button
                      key={item.omatapalo_code}
                      type="button"
                      onClick={() => addItem(item)}
                      className={cn(
                        "flex justify-between items-center w-full px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-zinc-50 dark:border-zinc-800 last:border-b-0",
                        orderLines.find(l => l.omatapalo_code === item.omatapalo_code) && "opacity-30 pointer-events-none"
                      )}
                    >
                      <div>
                        <span className="text-[10px] font-black text-blue-600 tracking-widest">{item.omatapalo_code}</span>
                        <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-zinc-400 uppercase">{item.unit || "UN"}</span>
                        <Plus className="h-4 w-4 text-blue-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Order lines table */}
          <div className="border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr className="text-[9px] uppercase font-black text-zinc-500 dark:text-zinc-400 tracking-[0.2em]">
                  <th className="px-5 py-3">Cód. Artigo</th>
                  <th className="px-5 py-3">Descrição</th>
                  <th className="px-5 py-3 text-center w-24">Qt. Pedida</th>
                  <th className="px-5 py-3 text-center w-16">Unid.</th>
                  {isEditing && <th className="px-5 py-3 text-center w-14"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {orderLines.length === 0 ? (
                  <tr>
                    <td colSpan={isEditing ? 5 : 4} className="px-5 py-8 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">
                      Nenhum artigo adicionado. Pesquise acima para adicionar.
                    </td>
                  </tr>
                ) : (
                  orderLines.map(line => (
                    <tr key={line.omatapalo_code} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono font-black text-blue-600 text-[10px] tracking-widest">{line.omatapalo_code}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 uppercase">{line.description}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            className="w-16 mx-auto text-center border-2 border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 bg-white dark:bg-zinc-950 text-[11px] font-black outline-none focus:border-blue-600 transition-all"
                            value={line.requestedQty}
                            onChange={e => updateItemQty(line.omatapalo_code, parseInt(e.target.value) || 1)}
                          />
                        ) : (
                          <span className="font-black text-[12px] text-zinc-700 dark:text-zinc-300">{line.requestedQty}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">{line.unit}</span>
                      </td>
                      {isEditing && (
                        <td className="px-5 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(line.omatapalo_code)}
                            className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 flex-shrink-0">
          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic">
            {orderLines.length} artigo{orderLines.length !== 1 ? "s" : ""} no pedido
          </span>
          <div className="flex items-center gap-8">
            <button type="button" onClick={() => onClose()} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900">
              {isEditing ? "CANCELAR" : "FECHAR"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedEquipmentId || orderLines.length === 0}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.1em] shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-30 disabled:hover:scale-100"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isNew ? "SUBMETER PEDIDO" : "GUARDAR ALTERAÇÕES"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
