"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2, PlusCircle, Image as ImageIcon, Paperclip, ListTree } from "lucide-react";
import { upsertArticle } from "@/app/artigos/actions";
import { getBrands } from "@/app/artigos/brands-actions";
import { getFamilies, getSubFamilies } from "@/app/artigos/hierarchy-actions";
import BrandFormModal from "./BrandFormModal";
import HierarchyManagerModal from "./HierarchyManagerModal";
import { cn } from "@/lib/utils";

interface ArticleFormProps {
  initialData?: any;
  onClose: (success?: boolean) => void;
}

export default function ArticleFormModal({ initialData, onClose }: ArticleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  
  const [brands, setBrands] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [subFamilies, setSubFamilies] = useState<any[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const isAdmin = true;

  const [formData, setFormData] = useState({
    omatapalo_code: initialData?.omatapalo_code || "",
    description: initialData?.description || "",
    family_id: initialData?.family_id || "",
    sub_family_id: initialData?.sub_family_id || "",
    unit: initialData?.unit || "UN",
    notes: initialData?.internal_notes || "",
  });

  const [partNumbers, setPartNumbers] = useState<any[]>(
    initialData?.item_part_numbers || []
  );

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (formData.family_id) {
      loadSubFamilies(formData.family_id);
    } else {
      setSubFamilies([]);
    }
  }, [formData.family_id]);

  const loadMasterData = async () => {
    setLoadingMaster(true);
    try {
      const [bData, fData] = await Promise.all([getBrands(), getFamilies()]);
      setBrands(bData);
      setFamilies(fData);
    } finally {
      setLoadingMaster(false);
    }
  };

  const loadSubFamilies = async (fId: string) => {
    try {
      const data = await getSubFamilies(fId);
      setSubFamilies(data);
    } catch (error) {
       console.error(error);
    }
  };

  const addPartNumber = () => {
    setPartNumbers([...partNumbers, { brand_id: "", part_number: "", description: "" }]);
  };

  const removePartNumber = (index: number) => {
    if (!isAdmin) { alert("Admin only."); return; }
    if (!confirm("Remover PN?")) return;
    setPartNumbers(partNumbers.filter((_, i) => i !== index));
  };

  const updatePartNumber = (index: number, field: string, value: string) => {
    const newList = [...partNumbers];
    newList[index] = { ...newList[index], [field]: value };
    setPartNumbers(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.omatapalo_code || !formData.description) return;
    setIsSubmitting(true);
    try {
      const selectedFam = families.find(f => f.id === formData.family_id)?.name;
      const selectedSub = subFamilies.find(s => s.id === formData.sub_family_id)?.name;
      await upsertArticle({ ...formData, family: selectedFam, sub_family: selectedSub }, partNumbers);
      onClose(true);
    } catch (error) {
       alert("Erro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
               {initialData ? (
                 <>EDITAR: <span className="text-blue-600">{initialData.omatapalo_code}</span></>
               ) : (
                 "NOVO ARTIGO"
               )}
            </h3>
          </div>
          <button onClick={() => onClose()} className="p-3 bg-white dark:bg-zinc-800 rounded-full hover:scale-110 transition-all border border-zinc-100 dark:border-zinc-700">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Primary Data */}
          <div className="w-[380px] border-r border-zinc-100 dark:border-zinc-800 px-6 py-8 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between h-10 mb-8 px-1">
               <div className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">
                  1. ATRIBUTOS BASE
               </div>
               <button type="button" onClick={() => setIsHierarchyModalOpen(true)} className="p-2 border border-zinc-100 dark:border-zinc-800 rounded-lg text-zinc-400 hover:text-blue-600 transition-colors">
                  <ListTree className="h-4 w-4" />
               </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">CÓDIGO OMATAPALO*</label>
                  <input 
                    required
                    disabled={!!initialData}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-[12px] font-black italic tracking-tighter uppercase text-blue-600 disabled:opacity-50"
                    value={formData.omatapalo_code}
                    onChange={(e) => setFormData({...formData, omatapalo_code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="w-24 space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">UN</label>
                  <select className="w-full px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-[11px] font-black uppercase" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                    <option value="UN">UN</option>
                    <option value="LT">LT</option>
                    <option value="KG">KG</option>
                    <option value="MT">MT</option>
                    <option value="CJ">CJ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">DESCRIÇÃO COMERCIAL*</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase resize-none leading-normal"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">FAMÍLIA</label>
                <select className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-[11px] font-black uppercase outline-none focus:border-blue-600" value={formData.family_id} onChange={(e) => setFormData({...formData, family_id: e.target.value, sub_family_id: ""})}>
                  <option value="">SELECIONAR...</option>
                  {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">SUB-FAMÍLIA</label>
                <select disabled={!formData.family_id} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-[11px] font-black uppercase outline-none focus:border-blue-600 disabled:opacity-30" value={formData.sub_family_id} onChange={(e) => setFormData({...formData, sub_family_id: e.target.value})}>
                  <option value="">SELECIONAR...</option>
                  {subFamilies.map(sf => <option key={sf.id} value={sf.id}>{sf.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">OBSERVAÇÕES DO ARTIGO</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase resize-none leading-normal"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value.toUpperCase()})}
                  placeholder="ESCREVA AQUI INFORMAÇÕES ADICIONAIS..."
                />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
            <div className="flex-1 p-8 pt-10 flex flex-col min-h-0 overflow-hidden">
               <div className="flex items-center justify-between h-10 mb-8">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-600 tracking-[0.2em]">
                     2. REFERÊNCIAS FABRICANTE
                  </div>
                  <div className="flex gap-3">
                     <button type="button" onClick={() => setIsBrandModalOpen(true)} className="px-5 py-2.5 border border-zinc-200 rounded-xl text-[9px] font-black uppercase hover:bg-zinc-50">CRIAR MARCA</button>
                     <button type="button" onClick={addPartNumber} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-all">ADICIONAR PN +</button>
                  </div>
               </div>

               <div className="flex-1 overflow-auto rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/10 custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 border-b-2 border-zinc-100 dark:border-zinc-800 z-10">
                      <tr className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.1em]">
                        <th className="px-6 py-3 font-black">FABRICANTE</th>
                        <th className="px-6 py-3 font-black">PART-NUMBER</th>
                        <th className="px-6 py-3 font-black">OBSERVAÇÕES</th>
                        <th className="px-6 py-3 text-right">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-zinc-50">
                      {partNumbers.map((pn, index) => (
                        <tr key={index} className="group hover:bg-zinc-50/50">
                          <td className="px-6 py-2.5">
                             <select required className="bg-transparent border-none outline-none text-[11px] font-black uppercase italic text-zinc-600 w-full" value={pn.brand_id} onChange={(e) => updatePartNumber(index, 'brand_id', e.target.value)}>
                                <option value="">...</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                             </select>
                          </td>
                          <td className="px-6 py-2.5">
                             <input required placeholder="REFERÊNCIA" className="bg-transparent border-none outline-none text-[11px] font-black uppercase text-blue-600 w-full tracking-tighter" value={pn.part_number} onChange={(e) => updatePartNumber(index, 'part_number', e.target.value.toUpperCase())} />
                          </td>
                          <td className="px-6 py-2.5">
                             <input placeholder="NOTA" className="bg-transparent border-none outline-none text-[10px] font-bold uppercase text-zinc-400 w-full" value={pn.description} onChange={(e) => updatePartNumber(index, 'description', e.target.value.toUpperCase())} />
                          </td>
                          <td className="px-6 py-2.5 text-right">
                             <button type="button" onClick={() => removePartNumber(index)} className="p-1.5 text-zinc-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      ))}
                      {partNumbers.length === 0 && (
                        <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">Sem referências.</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>

            <div className="px-8 pb-8 pt-2 bg-white flex gap-4">
               <div className="flex-1 p-5 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex items-center gap-4 group cursor-pointer hover:border-blue-400 transition-all">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><ImageIcon className="h-5 w-5" /></div>
                  <div>
                     <p className="text-[10px] font-black uppercase">FOTOS DO ARTIGO</p>
                     <p className="text-[8px] font-bold text-zinc-300 mt-0.5 whitespace-nowrap">CARREGAR IMAGENS</p>
                  </div>
               </div>
               <div className="flex-1 p-5 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex items-center gap-4 group cursor-pointer hover:border-green-400 transition-all">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Paperclip className="h-5 w-5" /></div>
                  <div>
                     <p className="text-[10px] font-black uppercase">DOCUMENTAÇÃO</p>
                     <p className="text-[8px] font-bold text-zinc-300 mt-0.5 whitespace-nowrap">NOTAS / PDF / FICHAS</p>
                  </div>
               </div>
            </div>
          </div>
        </form>

        <div className="px-10 py-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic">* CAMPOS OBRIGATÓRIOS</span>
          <div className="flex items-center gap-8">
            <button type="button" onClick={() => onClose()} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900">CANCELAR</button>
            <button 
              type="submit" 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.1em] shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-30"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "GRAVAR ARTIGO"}
            </button>
          </div>
        </div>
      </div>

      {isBrandModalOpen && <BrandFormModal onClose={(nb) => { setIsBrandModalOpen(false); if (nb) loadMasterData(); }} />}
      {isHierarchyModalOpen && <HierarchyManagerModal onClose={() => { setIsHierarchyModalOpen(false); loadMasterData(); }} />}
    </div>
  );
}
