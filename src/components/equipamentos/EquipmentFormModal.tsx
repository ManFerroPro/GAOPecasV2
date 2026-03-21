"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { upsertEquipment } from "@/app/equipamentos/actions";

interface EquipmentFormProps {
  initialData?: any;
  onClose: (success?: boolean) => void;
}

export default function EquipmentFormModal({ initialData, onClose }: EquipmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertEquipment(formData);
      onClose(true);
    } catch (error) {
      alert("Erro ao guardar: " + (error as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl border dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="text-xl font-bold">{initialData ? "Editar Equipamento" : "Novo Equipamento"}</h3>
          <button onClick={() => onClose()} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-zinc-500">Número da Máquina (ID)*</label>
              <input 
                required
                disabled={!!initialData}
                placeholder="Ex: EQ-999"
                className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
                value={formData.mobile_id}
                onChange={(e) => setFormData({...formData, mobile_id: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-zinc-500">Matrícula</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                value={formData.license_plate}
                onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-zinc-500">Marca*</label>
              <input 
                required
                placeholder="Ex: Caterpillar"
                className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-zinc-500">Modelo*</label>
              <input 
                required
                placeholder="Ex: 320D"
                className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-zinc-500">Chassis (VIN)</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                value={formData.vin}
                onChange={(e) => setFormData({...formData, vin: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-zinc-500">Ano</label>
              <input 
                type="number"
                className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-zinc-500">Observações</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
            />
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button"
              onClick={() => onClose()}
              className="flex-1 px-4 py-2 border dark:border-zinc-800 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              Cancelar
            </button>
            <button 
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {initialData ? "Atualizar" : "Criar Equipamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
