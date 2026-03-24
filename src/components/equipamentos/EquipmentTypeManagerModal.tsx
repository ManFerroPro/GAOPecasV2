"use client";

import { useState } from "react";
import { X, Plus, ChevronRight, Loader2 } from "lucide-react";
import { upsertEquipmentType, upsertEquipmentCategory, upsertEquipmentSubcategory } from "@/app/equipamentos/actions";

interface Props {
  initialTypes: any[];
  onClose: (updatedTypes?: any[]) => void;
}

export default function EquipmentTypeManagerModal({ initialTypes, onClose }: Props) {
  const [types, setTypes] = useState<any[]>(initialTypes);
  const [newTypeName, setNewTypeName] = useState("");
  const [savingType, setSavingType] = useState(false);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<Record<string, string>>({});
  const [newSubcategoryName, setNewSubcategoryName] = useState<Record<string, string>>({});
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [savingSubcategory, setSavingSubcategory] = useState<string | null>(null);

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;
    setSavingType(true);
    try {
      const t = await upsertEquipmentType(newTypeName);
      setTypes(prev => [...prev, { ...t, equipment_categories: [] }].sort((a,b) => a.name.localeCompare(b.name)));
      setNewTypeName("");
    } catch (e: any) { alert("Erro: " + e.message); }
    finally { setSavingType(false); }
  };

  const handleAddCategory = async (typeId: string) => {
    const name = newCategoryName[typeId];
    if (!name?.trim()) return;
    setSavingCategory(typeId);
    try {
      const cat = await upsertEquipmentCategory(typeId, name);
      setTypes(prev => prev.map(t => t.id === typeId
        ? { ...t, equipment_categories: [...(t.equipment_categories || []), { ...cat, equipment_subcategories: [] }].sort((a:any,b:any) => a.name.localeCompare(b.name)) }
        : t
      ));
      setNewCategoryName(prev => ({ ...prev, [typeId]: "" }));
    } catch (e: any) { alert("Erro: " + e.message); }
    finally { setSavingCategory(null); }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    const name = newSubcategoryName[categoryId];
    if (!name?.trim()) return;
    setSavingSubcategory(categoryId);
    try {
      const sub = await upsertEquipmentSubcategory(categoryId, name);
      setTypes(prev => prev.map(t => ({
        ...t,
        equipment_categories: (t.equipment_categories || []).map((c: any) => c.id === categoryId
          ? { ...c, equipment_subcategories: [...(c.equipment_subcategories || []), sub].sort((a:any,b:any) => a.name.localeCompare(b.name)) }
          : c
        )
      })));
      setNewSubcategoryName(prev => ({ ...prev, [categoryId]: "" }));
    } catch (e: any) { alert("Erro: " + e.message); }
    finally { setSavingSubcategory(null); }
  };

  const inputCls = "flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase";
  const labelCls = "text-[9px] font-black uppercase text-zinc-400 tracking-widest";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">

        {/* Header */}
        <div className="px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Tipos de Equipamento</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Tipo → Categoria → Subcategoria</p>
          </div>
          <button onClick={() => onClose(types)} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:scale-110 transition-all">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Add Type */}
        <div className="px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
          <p className={labelCls + " mb-2"}>Novo Tipo de Equipamento</p>
          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="EX: LIGEIRO DE PASSAGEIROS..."
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddType()}
            />
            <button
              onClick={handleAddType}
              disabled={savingType || !newTypeName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 disabled:opacity-30 transition-all"
            >
              {savingType ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Adicionar
            </button>
          </div>
        </div>

        {/* Types List */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3">
          {types.length === 0 && (
            <p className="text-center text-[10px] text-zinc-300 uppercase font-bold tracking-widest italic py-8">Sem tipos registados.</p>
          )}
          {types.map(type => (
            <div key={type.id} className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
              {/* Type row */}
              <button
                onClick={() => setExpandedType(expandedType === type.id ? null : type.id)}
                className="w-full px-5 py-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 transition-colors"
              >
                <span className="font-black uppercase text-[12px] tracking-wide">{type.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{type.equipment_categories?.length || 0} categorias</span>
                  <ChevronRight className={`h-4 w-4 text-zinc-400 transition-transform ${expandedType === type.id ? "rotate-90" : ""}`} />
                </div>
              </button>

              {expandedType === type.id && (
                <div className="px-5 py-3 space-y-2">
                  {/* Categories */}
                  {(type.equipment_categories || []).map((cat: any) => (
                    <div key={cat.id} className="ml-2 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                        className="w-full px-4 py-2 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900 hover:bg-zinc-50 transition-colors"
                      >
                        <span className="font-bold text-[11px] uppercase text-zinc-600 dark:text-zinc-300">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-zinc-300 uppercase">{cat.equipment_subcategories?.length || 0} sub.</span>
                          <ChevronRight className={`h-4 w-4 text-zinc-300 transition-transform ${expandedCategory === cat.id ? "rotate-90" : ""}`} />
                        </div>
                      </button>
                      {expandedCategory === cat.id && (
                        <div className="px-4 py-3 space-y-1.5">
                          {(cat.equipment_subcategories || []).map((sub: any) => (
                            <div key={sub.id} className="text-[10px] font-bold text-zinc-400 uppercase pl-2 border-l-2 border-zinc-100">{sub.name}</div>
                          ))}
                          <div className="flex gap-2 pt-1">
                            <input
                              className={inputCls + " text-[10px]"}
                              placeholder="NOVA SUBCATEGORIA..."
                              value={newSubcategoryName[cat.id] || ""}
                              onChange={e => setNewSubcategoryName(prev => ({ ...prev, [cat.id]: e.target.value }))}
                              onKeyDown={e => e.key === "Enter" && handleAddSubcategory(cat.id)}
                            />
                            <button
                              onClick={() => handleAddSubcategory(cat.id)}
                              disabled={savingSubcategory === cat.id || !newSubcategoryName[cat.id]?.trim()}
                              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 text-white rounded-xl font-black uppercase text-[9px] tracking-widest disabled:opacity-30 hover:opacity-80 transition-all"
                            >
                              {savingSubcategory === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Add Category */}
                  <div className="flex gap-2 pt-1 ml-2">
                    <input
                      className={inputCls + " text-[10px]"}
                      placeholder="NOVA CATEGORIA..."
                      value={newCategoryName[type.id] || ""}
                      onChange={e => setNewCategoryName(prev => ({ ...prev, [type.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleAddCategory(type.id)}
                    />
                    <button
                      onClick={() => handleAddCategory(type.id)}
                      disabled={savingCategory === type.id || !newCategoryName[type.id]?.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 text-white rounded-xl font-black uppercase text-[9px] tracking-widest disabled:opacity-30 hover:opacity-80 transition-all"
                    >
                      {savingCategory === type.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Categoria
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button onClick={() => onClose(types)} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all">
            Feito
          </button>
        </div>
      </div>
    </div>
  );
}
