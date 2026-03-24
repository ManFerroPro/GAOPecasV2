"use client";

import { useState } from "react";
import { X, Plus, ChevronRight, Loader2 } from "lucide-react";
import { upsertBrand, upsertModel } from "@/app/equipamentos/actions";

interface Props {
  initialBrands: any[];
  onClose: (updatedBrands?: any[]) => void;
}

export default function BrandModelManagerModal({ initialBrands, onClose }: Props) {
  const [brands, setBrands] = useState<any[]>(initialBrands);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState<Record<string, string>>({});
  const [savingModel, setSavingModel] = useState<string | null>(null);

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    setSavingBrand(true);
    try {
      const brand = await upsertBrand(newBrandName);
      setBrands(prev => [...prev, { ...brand, equipment_models: [] }].sort((a,b) => a.name.localeCompare(b.name)));
      setNewBrandName("");
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setSavingBrand(false);
    }
  };

  const handleAddModel = async (brandId: string) => {
    const name = newModelName[brandId];
    if (!name?.trim()) return;
    setSavingModel(brandId);
    try {
      const model = await upsertModel(brandId, name);
      setBrands(prev => prev.map(b => b.id === brandId
        ? { ...b, equipment_models: [...(b.equipment_models || []), model].sort((a:any,b:any) => a.name.localeCompare(b.name)) }
        : b
      ));
      setNewModelName(prev => ({ ...prev, [brandId]: "" }));
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setSavingModel(null);
    }
  };

  const labelCls = "text-[9px] font-black uppercase text-zinc-400 tracking-widest";
  const inputCls = "flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">

        {/* Header */}
        <div className="px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Marcas & Modelos</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Gestão de Marcas e Modelos de Equipamentos</p>
          </div>
          <button
            onClick={() => onClose(brands)}
            className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:scale-110 transition-all">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Add Brand */}
        <div className="px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
          <p className={labelCls + " mb-2"}>Nova Marca</p>
          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="NOME DA MARCA..."
              value={newBrandName}
              onChange={e => setNewBrandName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddBrand()}
            />
            <button
              onClick={handleAddBrand}
              disabled={savingBrand || !newBrandName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all disabled:opacity-30"
            >
              {savingBrand ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Adicionar
            </button>
          </div>
        </div>

        {/* Brands List */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3">
          {brands.length === 0 && (
            <p className="text-center text-[10px] text-zinc-300 uppercase font-bold tracking-widest italic py-8">Sem marcas registadas.</p>
          )}
          {brands.map(brand => (
            <div key={brand.id} className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
              {/* Brand Header */}
              <button
                onClick={() => setExpandedBrand(expandedBrand === brand.id ? null : brand.id)}
                className="w-full px-5 py-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="font-black uppercase text-[12px] tracking-wide">{brand.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{brand.equipment_models?.length || 0} modelos</span>
                  <ChevronRight className={`h-4 w-4 text-zinc-400 transition-transform ${expandedBrand === brand.id ? "rotate-90" : ""}`} />
                </div>
              </button>

              {/* Models */}
              {expandedBrand === brand.id && (
                <div className="px-5 py-3 space-y-2">
                  {brand.equipment_models?.map((model: any) => (
                    <div key={model.id} className="flex items-center gap-2 py-1.5 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                      <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase">{model.name}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <input
                      className={inputCls + " text-[10px]"}
                      placeholder="NOVO MODELO..."
                      value={newModelName[brand.id] || ""}
                      onChange={e => setNewModelName(prev => ({ ...prev, [brand.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleAddModel(brand.id)}
                    />
                    <button
                      onClick={() => handleAddModel(brand.id)}
                      disabled={savingModel === brand.id || !newModelName[brand.id]?.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-black uppercase text-[9px] tracking-widest hover:opacity-80 transition-all disabled:opacity-30"
                    >
                      {savingModel === brand.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Modelo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={() => onClose(brands)}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all"
          >
            Feito
          </button>
        </div>
      </div>
    </div>
  );
}
