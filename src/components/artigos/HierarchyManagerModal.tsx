"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Check, Loader2, ListTree } from "lucide-react";
import { getFamilies, getSubFamilies, createFamily, createSubFamily } from "@/app/artigos/hierarchy-actions";
import { cn } from "@/lib/utils";

interface HierarchyManagerProps {
  onClose: () => void;
}

export default function HierarchyManagerModal({ onClose }: HierarchyManagerProps) {
  const [families, setFamilies] = useState<any[]>([]);
  const [subFamilies, setSubFamilies] = useState<any[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newSubFamilyName, setNewSubFamilyName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Mock admin check
  const isAdmin = true;

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamilyId) {
      loadSubFamilies(selectedFamilyId);
    } else {
      setSubFamilies([]);
    }
  }, [selectedFamilyId]);

  const loadFamilies = async () => {
    setLoading(true);
    try {
      const data = await getFamilies();
      setFamilies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubFamilies = async (id: string) => {
    try {
      const data = await getSubFamilies(id);
      setSubFamilies(data);
    } catch (error) {
       console.error(error);
    }
  };

  const handleAddFamily = async () => {
    if (!newFamilyName.trim()) return;
    setIsAdding(true);
    try {
      const resp = await createFamily(newFamilyName);
      setFamilies([...families, resp]);
      setNewFamilyName("");
    } catch (error) {
       alert("Erro ao criar família.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddSubFamily = async () => {
    if (!selectedFamilyId || !newSubFamilyName.trim()) return;
    setIsAdding(true);
    try {
      const resp = await createSubFamily(selectedFamilyId, newSubFamilyName);
      setSubFamilies([...subFamilies, resp]);
      setNewSubFamilyName("");
    } catch (error) {
       alert("Erro ao criar sub-família.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl shadow-2xl border-2 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-8 border-b-2 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <ListTree className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Gestão de Hierarquia</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Famílias & Sub-Famílias</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Families List */}
          <div className="w-1/2 p-8 border-r-2 dark:border-zinc-800 flex flex-col gap-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-blue-600">1. Famílias</h4>
            
            <div className="flex gap-2">
               <input 
                 placeholder="NOVA FAMÍLIA..."
                 className="flex-1 px-4 py-2 rounded-xl border-2 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-500 text-xs font-bold uppercase"
                 value={newFamilyName}
                 onChange={(e) => setNewFamilyName(e.target.value)}
               />
               <button 
                 onClick={handleAddFamily}
                 disabled={isAdding || !newFamilyName.trim()}
                 className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
               >
                 <Plus className="h-5 w-5" />
               </button>
            </div>

            <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
               {families.map(f => (
                 <div 
                   key={f.id}
                   onClick={() => setSelectedFamilyId(f.id)}
                   className={cn(
                     "group flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                     selectedFamilyId === f.id 
                       ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                       : "bg-white border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 hover:border-zinc-200"
                   )}
                 >
                   <span className="font-black text-xs uppercase">{f.name}</span>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-zinc-400 hover:text-blue-500"><Edit2 className="h-3.5 w-3.5" /></button>
                      {isAdmin && <button className="p-1.5 text-zinc-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>}
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Sub-Families List */}
          <div className="w-1/2 p-8 flex flex-col gap-6 bg-zinc-50/30 dark:bg-zinc-950/20">
            <h4 className={cn("text-sm font-black uppercase tracking-widest transition-all", selectedFamilyId ? "text-amber-600" : "text-zinc-300 opacity-50")}>
              2. Sub-Famílias {selectedFamilyId && `(em ${families.find(f => f.id === selectedFamilyId)?.name})`}
            </h4>

            {selectedFamilyId ? (
              <>
                <div className="flex gap-2">
                  <input 
                    placeholder="NOVA SUB-FAMÍLIA..."
                    className="flex-1 px-4 py-2 rounded-xl border-2 dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:border-amber-500 text-xs font-bold uppercase"
                    value={newSubFamilyName}
                    onChange={(e) => setNewSubFamilyName(e.target.value)}
                  />
                  <button 
                    onClick={handleAddSubFamily}
                    disabled={isAdding || !newSubFamilyName.trim()}
                    className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
                  {subFamilies.map(sf => (
                    <div key={sf.id} className="group flex items-center justify-between p-4 rounded-2xl border-2 bg-white dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 hover:border-amber-200 dark:hover:border-amber-900/40 transition-all">
                      <span className="font-bold text-xs uppercase text-zinc-600 dark:text-zinc-400">{sf.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-zinc-400 hover:text-amber-600"><Edit2 className="h-3.5 w-3.5" /></button>
                        {isAdmin && <button className="p-1.5 text-zinc-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>}
                      </div>
                    </div>
                  ))}
                  {subFamilies.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-xs py-10">
                       Nenhuma sub-família criada.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl">
                 <ListTree className="h-12 w-12 mb-4" />
                 <p className="text-sm font-black uppercase">Selecione uma Família à esquerda para ver sub-famílias</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
