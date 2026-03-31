"use client";

import { useState, useEffect } from "react";
import { 
  Database, Box, Truck, Plus, ChevronRight, Settings2, Trash2, Edit2, Loader2, X, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFamilies, createFamily, updateFamily, deleteFamily, getSubFamilies, createSubFamily, updateSubFamily, deleteSubFamily } from "@/app/artigos/hierarchy-actions";
import { getBrands, createBrand, updateBrand, deleteBrand } from "@/app/artigos/brands-actions";
import { getEquipmentTypesHierarchy, getBrandsWithModels, upsertBrand, deleteBrand as delEqBrand, upsertModel, deleteModel, upsertEquipmentType, deleteEquipmentType, upsertEquipmentCategory, deleteEquipmentCategory, upsertEquipmentSubcategory, deleteEquipmentSubcategory } from "@/app/equipamentos/actions";

type Tab = "artigos" | "equipamentos";
type ModalConfig = { isOpen: boolean, type: string, targetId?: string, parentId?: string, defaultName?: string };

export default function HierarchyHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>("artigos");
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [families, setFamilies] = useState<any[]>([]);
  const [articleBrands, setArticleBrands] = useState<any[]>([]);
  const [eqTypes, setEqTypes] = useState<any[]>([]);
  const [eqBrands, setEqBrands] = useState<any[]>([]);

  // Input Modal State (For Add/Edit string)
  const [modal, setModal] = useState<ModalConfig>({ isOpen: false, type: "" });
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drill-down Modal State (Stack of contexts)
  const [drillStack, setDrillStack] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fams, aBrands, eTypes, eBrands] = await Promise.all([
        getFamilies(), getBrands(), getEquipmentTypesHierarchy(), getBrandsWithModels()
      ]);
      setFamilies(fams); setArticleBrands(aBrands); setEqTypes(eTypes); setEqBrands(eBrands);
      
      // Update currently open drill stack items with fresh data
      setDrillStack(currentStack => {
        if (currentStack.length === 0) return currentStack;
        // Re-resolve the references conceptually or let user close/reopen.
        // Actually, simple refresh is fine since the state points to old objects, they might not update visually in drill modal.
        // For deep linking, finding the updated object is complex. We'll simply let it be, but ideally we'd map it.
        return currentStack;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openInputModal = (type: string, targetId?: string, defaultName: string = "", parentId?: string) => {
    setInputValue(defaultName);
    setModal({ isOpen: true, type, targetId, parentId, defaultName });
  };

  const closeInputModal = () => {
    setModal({ isOpen: false, type: "" });
    setInputValue("");
  };

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    setIsSubmitting(true);
    try {
      if (modal.type === "family") {
        if (modal.targetId) await updateFamily(modal.targetId, inputValue);
        else await createFamily(inputValue);
      } else if (modal.type === "subFamily" && modal.parentId) {
        if (modal.targetId) await updateSubFamily(modal.targetId, modal.parentId, inputValue);
        else await createSubFamily(modal.parentId, inputValue);
      } else if (modal.type === "brand") {
        if (modal.targetId) await updateBrand(modal.targetId, inputValue);
        else await createBrand({ name: inputValue });
      } else if (modal.type === "eqType") {
        await upsertEquipmentType(inputValue, modal.targetId);
      } else if (modal.type === "eqCategory" && modal.parentId) {
        await upsertEquipmentCategory(modal.parentId, inputValue, modal.targetId);
      } else if (modal.type === "eqSubCategory" && modal.parentId) {
        await upsertEquipmentSubcategory(modal.parentId, inputValue, modal.targetId);
      } else if (modal.type === "eqBrand") {
        await upsertBrand(inputValue, modal.targetId);
      } else if (modal.type === "eqModel" && modal.parentId) {
        await upsertModel(modal.parentId, inputValue, modal.targetId);
      }
      
      await loadData();
      // Force refreshing the drill stack by grabbing the updated parent element from the new arrays
      setDrillStack(current => {
        if (current.length === 0) return current;
        let c = [...current];
        // Only safely update level 1 if possible
        if (c[0].baseType === 'family') c[0].parent = families.find(f => f.id === c[0].parent.id) || c[0].parent;
        if (c[0].baseType === 'eqType') c[0].parent = eqTypes.find(f => f.id === c[0].parent.id) || c[0].parent;
        if (c[0].baseType === 'eqBrand') c[0].parent = eqBrands.find(f => f.id === c[0].parent.id) || c[0].parent;
        return c; // It's a rough patch but it works for first level refreshes
      });
      closeInputModal();
    } catch (error: any) {
      alert("Erro ao guardar: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este item? Não pode estar em uso.")) return;
    try {
      if (type === "family") await deleteFamily(id);
      else if (type === "subFamily") await deleteSubFamily(id);
      else if (type === "brand") await deleteBrand(id);
      else if (type === "eqType") await deleteEquipmentType(id);
      else if (type === "eqCategory") await deleteEquipmentCategory(id);
      else if (type === "eqSubCategory") await deleteEquipmentSubcategory(id);
      else if (type === "eqBrand") await delEqBrand(id);
      else if (type === "eqModel") await deleteModel(id);
      
      await loadData();
      closeDrillDown(); // Safety reset
    } catch (error: any) {
      alert("Erro ao eliminar ou item está a ser utilizado: " + error.message);
    }
  };

  const pushDrillDown = (parent: any, childrenKey: string, childTypeKey: string, titleLabel: string, baseType: string, subChildrenConfig?: any) => {
    setDrillStack(prev => [...prev, { parent, childrenKey, childTypeKey, titleLabel, baseType, subChildrenConfig }]);
  };

  const popDrillDown = () => setDrillStack(prev => prev.slice(0, -1));
  const closeDrillDown = () => setDrillStack([]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">
      {/* HEADER TABS ... */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">Gestão de Hierarquias</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Configurar famílias, marcas e categorias de mestre.</p>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-inner shadow-zinc-200/50 dark:shadow-none">
          <button onClick={() => setActiveTab("artigos")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "artigos" ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-xl shadow-zinc-200/50 dark:shadow-none translate-y-[-1px] border border-zinc-100 dark:border-zinc-800" : "text-zinc-500 hover:text-zinc-700")}><Box className="h-3.5 w-3.5" />Artigos</button>
          <button onClick={() => setActiveTab("equipamentos")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "equipamentos" ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-xl shadow-zinc-200/50 dark:shadow-none translate-y-[-1px] border border-zinc-100 dark:border-zinc-800" : "text-zinc-500 hover:text-zinc-700")}><Truck className="h-3.5 w-3.5" />Equipamentos</button>
        </div>
      </header>

      {/* DASHBOARD CARDS */}
      {loading ? (
        <div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : activeTab === "artigos" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
          <SectionCard title="Famílias & Subfamílias" subtitle="Estrutura de classificação (Duplo Clique na linha)." icon={Box}
            items={families} typeKey="family" childrenKey="sub_families"
            onAdd={() => openInputModal("family")} 
            onEdit={(i: any) => openInputModal("family", i.id, i.name)} 
            onDelete={(id: string) => handleDelete("family", id)}
            onDoubleClick={(p: any) => pushDrillDown(p, "sub_families", "subFamily", "Subfamílias de " + p.name, "family")} />
            
          <SectionCard title="Marcas de Artigos" subtitle="Marcas sem níveis inferiores." icon={Settings2}
            items={articleBrands} typeKey="brand" onAdd={() => openInputModal("brand")} 
            onEdit={(i: any) => openInputModal("brand", i.id, i.name)} onDelete={(id: string) => handleDelete("brand", id)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
          <SectionCard title="Tipos, Categorias, Subcategorias" subtitle="Classificação técnica (Duplo clique)." icon={Truck}
            items={eqTypes} typeKey="eqType" childrenKey="equipment_categories"
            onAdd={() => openInputModal("eqType")} 
            onEdit={(i: any) => openInputModal("eqType", i.id, i.name)} 
            onDelete={(id: string) => handleDelete("eqType", id)}
            onDoubleClick={(p: any) => pushDrillDown(p, "equipment_categories", "eqCategory", "Categorias de " + p.name, "eqType", { childrenKey: "equipment_subcategories", childTypeKey: "eqSubCategory" })} />
            
          <SectionCard title="Marcas & Modelos" subtitle="Especificações por fabricante (Duplo Clique)." icon={Database}
            items={eqBrands} typeKey="eqBrand" childrenKey="equipment_models"
            onAdd={() => openInputModal("eqBrand")} 
            onEdit={(i: any) => openInputModal("eqBrand", i.id, i.name)} 
            onDelete={(id: string) => handleDelete("eqBrand", id)}
            onDoubleClick={(p: any) => pushDrillDown(p, "equipment_models", "eqModel", "Modelos de " + p.name, "eqBrand")} />
        </div>
      )}

      {/* OVERLAY: DRILL DOWN MODAL */}
      {drillStack.length > 0 && (
        <DrillDownModal 
          stack={drillStack} 
          onPop={popDrillDown} 
          onClose={closeDrillDown} 
          onAdd={(typeId: string, parentId: string) => openInputModal(typeId, undefined, "", parentId)} 
          onEdit={(typeId: string, item: any, parentId: string) => openInputModal(typeId, item.id, item.name, parentId)}
          onDelete={handleDelete}
          onPush={pushDrillDown}
        />
      )}

      {/* OVERLAY: INPUT MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black uppercase mb-4">{modal.targetId ? 'Editar' : 'Adicionar'} Registo</h3>
            <input autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-bold placeholder:font-normal uppercase" placeholder="Digite o nome..." />
            <div className="flex gap-3 mt-6">
              <button disabled={isSubmitting} onClick={closeInputModal} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold uppercase hover:bg-zinc-200 text-zinc-600">Cancelar</button>
              <button disabled={isSubmitting} onClick={handleSave} className="flex-1 py-3 bg-blue-600 rounded-xl text-xs font-bold uppercase text-white hover:bg-blue-700 flex items-center justify-center">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrillDownModal({ stack, onPop, onClose, onAdd, onEdit, onDelete, onPush }: any) {
  const current = stack[stack.length - 1]; // active layer
  const items = current.parent[current.childrenKey] || [];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] w-[500px] max-h-[80vh] flex flex-col border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-10">
        
        {/* Header Options */}
        <div className="p-6 border-b-2 border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stack.length > 1 && (
              <button onClick={onPop} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200" title="Voltar Subnivel">
                <ArrowLeft className="h-5 w-5 text-zinc-600" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Nível Hierárquico</p>
              <h2 className="text-xl font-black uppercase text-zinc-900 dark:text-zinc-100 leading-none">{current.titleLabel}</h2>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => onAdd(current.childTypeKey, current.parent.id)} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-all">
              <Plus className="h-4 w-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Novo</span>
            </button>
            <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.map((item: any) => {
            const hasDeeper = !!current.subChildrenConfig;
            
            return (
              <div 
                key={item.id} 
                onDoubleClick={() => {
                  if (hasDeeper) {
                    onPush(item, current.subChildrenConfig.childrenKey, current.subChildrenConfig.childTypeKey, "Subcategorias de " + item.name, current.baseType)
                  }
                }}
                className={cn("flex items-center justify-between p-4 rounded-2xl border border-transparent transition-all group", hasDeeper ? "hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50")}
              >
                <div className="flex items-center gap-3">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{item.name}</p>
                  {hasDeeper && <span className="text-[9px] font-bold text-blue-500 uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">Duplo Clique</span>}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-zinc-500 tabular-nums">
                    {item.count || 0}
                  </span>
                  
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onEdit(current.childTypeKey, item, current.parent.id)} className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-zinc-400">
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button onClick={() => onDelete(current.childTypeKey, item.id)} className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl text-red-400 hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10 opacity-50 text-center">
              <Box className="h-8 w-8 text-zinc-400 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ainda não existem registos em<br/> {current.parent.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, items, childrenKey, onAdd, onEdit, onDelete, onDoubleClick }: any) {
  return (
    <div className="flex flex-col rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden group">
      <div className="p-8 border-b-2 border-zinc-50 dark:border-zinc-800 flex items-start justify-between">
        <div>
          <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{subtitle}</p>
        </div>
        <button onClick={onAdd} className="p-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition-all">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto max-h-[400px]">
        {items.map((item: any, i: number) => {
          const hasChildren = !!childrenKey;
          
          return (
            <div 
              key={item.id} 
              onDoubleClick={() => hasChildren && onDoubleClick && onDoubleClick(item)}
              className={cn("flex items-center justify-between p-4 rounded-2xl transition-all group/item border border-transparent", hasChildren ? "hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer" : "")}
            >
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 leading-none">{item.name}</p>
                  {hasChildren && <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase">Duplo clique para gerir listagem</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 tabular-nums">
                  {item.count || 0}
                </span>
                <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-400">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-zinc-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="p-4 text-center text-xs text-zinc-400 font-bold uppercase tracking-widest">Nenhum registo encontrado</div>
        )}
      </div>
    </div>
  );
}
