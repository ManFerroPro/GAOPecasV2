"use client";

import { useState } from "react";
import { X, Save, Building2, MapPin, Hash, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DelegationFormProps {
  initialData?: any;
  onClose: (data?: any) => void;
}

export default function DelegationFormModal({ initialData, onClose }: DelegationFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || Math.random().toString(36).substr(2, 9),
    name: initialData?.name || "",
    code: initialData?.code || "",
    address: initialData?.address || "",
    status: initialData?.status || "Ativo",
    usersCount: initialData?.usersCount || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("Por favor preencha os campos obrigatórios.");
      return;
    }
    onClose(formData);
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-xl overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
                {initialData ? "EDITAR DELEGAÇÃO" : "NOVA DELEGAÇÃO"}
              </h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Gerir centro de operações.</p>
            </div>
          </div>
          <button onClick={() => onClose()} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all border border-zinc-100 dark:border-zinc-700">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">NOME DA DELEGAÇÃO*</label>
              <input
                required
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600/30 transition-all text-[12px] font-black uppercase tracking-tight"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="Ex: Luanda - Sede"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">CÓDIGO INTERNO*</label>
                <div className="relative">
                  <input
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600/30 transition-all text-[12px] font-black uppercase tracking-tight"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: LUA-01"
                  />
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">ESTADO</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-100 dark:border-zinc-800 h-[52px]">
                   <button type="button" onClick={() => setFormData({...formData, status: "Ativo"})} className={cn("flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all", formData.status === "Ativo" ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>Ativo</button>
                   <button type="button" onClick={() => setFormData({...formData, status: "Inativo"})} className={cn("flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all", formData.status === "Inativo" ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>Inativo</button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">MORADA / LOCALIZAÇÃO</label>
              <div className="relative">
                <input
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600/30 transition-all text-[11px] font-bold"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Viana, Luanda"
                />
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-4">
            <button type="button" onClick={() => onClose()} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">Cancelar</button>
            <button type="submit" className="flex items-center gap-3 px-10 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:translate-y-1">
              <Save className="h-4 w-4" />
              {initialData ? "GUARDAR ALTERAÇÕES" : "CRIAR DELEGAÇÃO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
