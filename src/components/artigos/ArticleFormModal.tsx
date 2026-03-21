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
      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="p-10 border-b-2 border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
               {initialData ? "Ficha do Artigo" : "Criação de Artigo"}
            </h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Configuração de Mestre de Dados</p>
          </div>
          <button onClick={() => onClose()} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-full hover:scale-110 transition-all">
            <X className="h-6 w-6 text-zinc-400" />
          </button>
        </div>

        {/* Scrollable Form Content - VERTICAL STACK */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-12 space-y-16 custom-scrollbar">
          
          {/* Section 1: Dados Principais */}
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">
               <span className="w-2 h-2 rounded-full bg-blue-600" />
               1. Dados Principais do Artigo
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-300 tracking-widest pl-1">Código Omatapalo*</label>
                <input 
                  required
                  disabled={!!initialData}
                  placeholder="MF01020338"
                  className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-sm font-black italic tracking-tighter uppercase disabled:opacity-40"
                  value={formData.omatapalo_code}
                  onChange={(e) => setFormData({...formData, omatapalo_code: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-300 tracking-widest pl-1">Unidade</label>
                <select 
                  className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-sm font-black uppercase"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="UN">UN (Unidade)</option>
                  <option value="LT">LT (Litros)</option>
                  <option value="KG">KG (Quilos)</option>
                  <option value="MT">MT (Metros)</option>
                  <option value="CJ">CJ (Conjunto)</option>
                </select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-zinc-300 tracking-widest pl-1">Descrição do Item*</label>
                <input 
                  required
                  placeholder="EX: FILTRO OLEO VOLVO..."
                  className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-sm font-bold uppercase"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">Família / Categoria</label>
                  <button type="button" onClick={() => setIsHierarchyModalOpen(true)} className="text-[10px] font-black text-blue-600 hover:underline">GERIR +</button>
                </div>
                <select className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-black uppercase outline-none focus:border-blue-600" value={formData.family_id} onChange={(e) => setFormData({...formData, family_id: e.target.value, sub_family_id: ""})}>
                  <option value="">SELECIONAR...</option>
                  {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">Sub-Família</label>
                  <button type="button" onClick={() => setIsHierarchyModalOpen(true)} className="text-[10px] font-black text-blue-600 hover:underline">GERIR +</button>
                </div>
                <select disabled={!formData.family_id} className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-black uppercase outline-none focus:border-blue-600 disabled:opacity-30" value={formData.sub_family_id} onChange={(e) => setFormData({...formData, sub_family_id: e.target.value})}>
                  <option value="">SELECIONAR...</option>
                  {subFamilies.map(sf => <option key={sf.id} value={sf.id}>{sf.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Part-Numbers Alternativos */}
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-400">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-600 tracking-[0.2em]">
                   <span className="w-2 h-2 rounded-full bg-amber-500" />
                   2. Referências Cruzadas / Part-Numbers
                </div>
                <div className="flex gap-4">
                   <button type="button" onClick={() => setIsBrandModalOpen(true)} className="px-5 py-2 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-zinc-50">NOVA MARCA +</button>
                   <button type="button" onClick={addPartNumber} className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[9px] font-black tracking-widest uppercase hover:scale-105 transition-all">ADICIONAR PN +</button>
                </div>
             </div>

             <div className="max-h-[300px] overflow-auto rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-zinc-900 border-b-2 border-zinc-100 dark:border-zinc-800 z-10">
                    <tr className="text-[10px] uppercase font-black text-zinc-300 tracking-[0.1em]">
                      <th className="px-8 py-5">Fabricante</th>
                      <th className="px-8 py-5">PN Original / Alternativo</th>
                      <th className="px-8 py-5">Observações Técnicas</th>
                      <th className="px-8 py-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 border-zinc-50 dark:border-zinc-800">
                    {partNumbers.map((pn, index) => (
                      <tr key={index} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                        <td className="px-8 py-4">
                           <select required className="bg-transparent border-none outline-none text-xs font-black uppercase italic text-zinc-600 dark:text-zinc-300 w-full" value={pn.brand_id} onChange={(e) => updatePartNumber(index, 'brand_id', e.target.value)}>
                              <option value="">ESCOLHER...</option>
                              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                           </select>
                        </td>
                        <td className="px-8 py-4">
                           <input required placeholder="REFERÊNCIA..." className="bg-transparent border-none outline-none text-xs font-black uppercase text-blue-600 w-full tracking-tighter" value={pn.part_number} onChange={(e) => updatePartNumber(index, 'part_number', e.target.value.toUpperCase())} />
                        </td>
                        <td className="px-8 py-4">
                           <input placeholder="NOTA..." className="bg-transparent border-none outline-none text-[11px] font-bold uppercase text-zinc-400 w-full" value={pn.description} onChange={(e) => updatePartNumber(index, 'description', e.target.value.toUpperCase())} />
                        </td>
                        <td className="px-8 py-4 text-right">
                           <button type="button" onClick={() => removePartNumber(index)} className="p-2 text-zinc-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {partNumbers.length === 0 && (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">Nenhuma referência alternativa adicionada.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>

          {/* Section 3: Anexos Visuais */}
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-600 tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                3. Anexos & Mídia Técnico
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="p-10 rounded-[2.5rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-blue-300 hover:bg-blue-50/10 transition-all">
                   <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl group-hover:scale-110 transition-all"><ImageIcon className="h-8 w-8" /></div>
                   <div className="text-center">
                     <p className="text-[11px] font-black uppercase tracking-widest">Carregar Fotos</p>
                     <p className="text-[9px] font-bold text-zinc-300 uppercase mt-1">IMAGENS DO ARTIGO</p>
                   </div>
                </div>

                <div className="p-10 rounded-[2.5rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-green-300 hover:bg-green-50/10 transition-all">
                   <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl group-hover:scale-110 transition-all"><Paperclip className="h-8 w-8" /></div>
                   <div className="text-center">
                     <p className="text-[11px] font-black uppercase tracking-widest">Documentos PDF</p>
                     <p className="text-[9px] font-bold text-zinc-300 uppercase mt-1">FICHAS TÉCNICAS / NOTAS</p>
                   </div>
                </div>
             </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-10 border-t-2 border-zinc-50 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-end gap-6 text-[10px] items-center">
          <button type="button" onClick={() => onClose()} className="font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">Abortar Operação</button>
          <button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="px-12 py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all disabled:opacity-30"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Gravar Tudo no Banco"}
          </button>
        </div>
      </div>

      {isBrandModalOpen && <BrandFormModal onClose={(nb) => { setIsBrandModalOpen(false); if (nb) loadMasterData(); }} />}
      {isHierarchyModalOpen && <HierarchyManagerModal onClose={() => { setIsHierarchyModalOpen(false); loadMasterData(); }} />}
    </div>
  );
}
