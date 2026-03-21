"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { createBrand } from "@/app/artigos/brands-actions";

interface BrandFormProps {
  onClose: (newBrand?: any) => void;
}

export default function BrandFormModal({ onClose }: BrandFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await createBrand({ name, description });
      onClose(data);
    } catch (error) {
      alert("Erro ao criar marca: " + (error as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="text-xl font-bold">Nova Marca / Fabricante</h3>
          <button onClick={() => onClose()} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-zinc-500">Nome da Marca*</label>
            <input 
              required
              autoFocus
              placeholder="Ex: CATERPILLAR"
              className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm uppercase font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-zinc-500">Descrição / Observações</label>
            <textarea 
              rows={3}
              placeholder="Opcional..."
              className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button"
              onClick={() => onClose()}
              className="flex-1 px-4 py-2 border dark:border-zinc-800 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm"
            >
              Cancelar
            </button>
            <button 
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Marca
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
