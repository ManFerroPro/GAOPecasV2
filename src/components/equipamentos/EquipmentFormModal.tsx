"use client";

import { useState } from "react";
import { X, Loader2, Edit2, Trash2 } from "lucide-react";
import { upsertEquipment, deleteEquipment } from "@/app/equipamentos/actions";

interface EquipmentFormProps {
  initialData?: any;
  onClose: (success?: boolean) => void;
}

export default function EquipmentFormModal({ initialData, onClose }: EquipmentFormProps) {
  const [isEditing, setIsEditing] = useState(!initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = true;

  const [formData, setFormData] = useState({
    mobile_id: initialData?.mobile_id || "",
    license_plate: initialData?.license_plate || "",
    vin: initialData?.vin || "",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    year: initialData?.year || new Date().getFullYear(),
    engine_no: initialData?.engine_no || "",
    observations: initialData?.observations || "",
  });

  const handleDeleteAction = async () => {
    if (!formData.mobile_id) return;
    if (!confirm("Tem a certeza que deseja eliminar este equipamento?")) return;
    try {
      await deleteEquipment(formData.mobile_id);
      onClose(true);
    } catch {
      alert("Erro ao eliminar o equipamento.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile_id || !formData.brand || !formData.model) return;
    setIsSubmitting(true);
    try {
      await upsertEquipment(formData);
      alert("Equipamento guardado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      alert("Erro ao guardar: " + (error as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase disabled:opacity-50";
  const labelCls = "text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1";

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-2xl flex flex-col overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">

        {/* Header */}
        <div className="px-8 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-6">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
              {initialData ? (
                <>EQUIPAMENTO: <span className="text-blue-600">{initialData.mobile_id}</span></>
              ) : (
                "NOVO EQUIPAMENTO"
              )}
            </h3>
            {!isEditing && isAdmin && initialData && (
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
        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Nº Máquina (ID)*</label>
              <input
                required
                disabled={!isEditing || !!initialData}
                placeholder="Ex: EQ-999"
                className={inputCls + " font-black italic tracking-tighter text-blue-600 text-[12px]"}
                value={formData.mobile_id}
                onChange={(e) => setFormData({...formData, mobile_id: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Matrícula</label>
              <input
                disabled={!isEditing}
                className={inputCls}
                value={formData.license_plate}
                onChange={(e) => setFormData({...formData, license_plate: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Marca*</label>
              <input
                required
                disabled={!isEditing}
                placeholder="Ex: Caterpillar"
                className={inputCls}
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Modelo*</label>
              <input
                required
                disabled={!isEditing}
                placeholder="Ex: 320D"
                className={inputCls}
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Ano</label>
              <input
                type="number"
                disabled={!isEditing}
                className={inputCls}
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Chassis (VIN)</label>
              <input
                disabled={!isEditing}
                className={inputCls + " font-mono"}
                value={formData.vin}
                onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Nº Motor</label>
              <input
                disabled={!isEditing}
                className={inputCls + " font-mono"}
                value={formData.engine_no}
                onChange={(e) => setFormData({...formData, engine_no: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Observações</label>
            <textarea
              disabled={!isEditing}
              rows={4}
              className={inputCls + " resize-none leading-normal"}
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value.toUpperCase()})}
              placeholder="ESCREVA AQUI INFORMAÇÕES ADICIONAIS..."
            />
          </div>

        </form>

        {/* Footer */}
        <div className="px-8 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic">* CAMPOS OBRIGATÓRIOS</span>
          <div className="flex items-center gap-8">
            <button type="button" onClick={() => onClose()} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900">
              {isEditing ? "CANCELAR" : "FECHAR"}
            </button>
            {isEditing && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.1em] shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-30"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "GUARDAR ALTERAÇÕES"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
