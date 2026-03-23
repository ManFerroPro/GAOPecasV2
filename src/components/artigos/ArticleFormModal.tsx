"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, Plus, Trash2, PlusCircle, Image as ImageIcon, Paperclip, ListTree, ExternalLink, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { upsertArticle, saveAttachment, getAttachments, deleteAttachment } from "@/app/artigos/actions";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
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
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const photoScrollRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState<"Fotos" | "Documentos" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, getPublicUrl } = useSupabaseStorage();

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
    if (initialData?.omatapalo_code) {
      loadAttachments(initialData.omatapalo_code);
    }
  }, []);

  const loadAttachments = async (code: string) => {
    setLoadingAttachments(true);
    try {
      const data = await getAttachments(code);
      setAttachments(data);
    } catch (error) {
      console.error("Error loading attachments:", error);
    } finally {
      setLoadingAttachments(false);
    }
  };

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "Fotos" | "Documentos") => {
    const file = e.target.files?.[0];
    if (!file || !formData.omatapalo_code) return;

    setUploading(type);
    try {
      const cleanCode = formData.omatapalo_code.replace(/"/g, '');
      const timestamp = new Date().getTime();
      
      const sanitizedName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-zA-Z0-9.-]/g, "_"); 
        
      const filePath = `${cleanCode}/${type}/${timestamp}_${sanitizedName}`;
      
      try {
        await uploadFile("artigos", filePath, file);
      } catch (storageErr: any) {
        throw new Error(`STORAGE: ${storageErr.message || JSON.stringify(storageErr)}`);
      }

      const publicUrl = getPublicUrl("artigos", filePath);
      
      try {
        await saveAttachment(
          cleanCode, 
          type === "Fotos" ? "image" : "document", 
          publicUrl, 
          sanitizedName
        );
        await loadAttachments(cleanCode);
      } catch (dbErr: any) {
        throw new Error(`DATABASE: ${dbErr.message || "Erro ao salvar registro na DB"}`);
      }
      
      alert("Ficheiro carregado com sucesso!");
    } catch (error: any) {
      console.error("Upload process failed:", error);
      alert(`FALHA NO PROCESSO:\n\n${error.message || JSON.stringify(error)}`);
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAttachment = async (id: string, filePath: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este anexo?")) return;
    try {
      let relativePath = filePath;
      if (filePath.includes('/public/artigos/')) {
        relativePath = filePath.split('/public/artigos/')[1];
      }

      await deleteAttachment(id, relativePath);
      if (formData.omatapalo_code) loadAttachments(formData.omatapalo_code);
    } catch (error) {
      alert("Erro ao eliminar anexo.");
    }
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
        <div className="px-8 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
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
          <div className="w-[380px] border-r border-zinc-100 dark:border-zinc-800 px-6 py-3 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between h-10 mb-3 px-1">
               <div className="text-[12px] font-black uppercase text-blue-600 tracking-[0.2em]">
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
            <div className="flex-1 p-8 pt-3 flex flex-col min-h-0 overflow-hidden">
               <div className="flex items-center justify-between h-10 mb-3">
                  <div className="flex items-center gap-2 text-[12px] font-black uppercase text-amber-600 tracking-[0.2em]">
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

            <div className="px-8 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={(e) => handleFileUpload(e, uploading === "Fotos" ? "Fotos" : "Documentos")} 
               />
               <div className="grid grid-cols-2 gap-8 h-40">
                  {/* FOTOS SECTION */}
                  <div className="flex flex-col min-w-0 h-full">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">FOTOS ({attachments.filter(a => a.file_type === 'image').length})</span>
                           {loadingAttachments && <Loader2 className="h-3 w-3 animate-spin text-zinc-300" />}
                        </div>
                        <button 
                          type="button"
                          onClick={() => { if(!formData.omatapalo_code) { alert("Introduza o código antes."); return; } setUploading("Fotos"); fileInputRef.current?.click(); }}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                        >
                           {uploading === "Fotos" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-2.5 w-2.5" />}
                           FOTO
                        </button>
                     </div>

                     <div className="relative group flex-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl overflow-hidden">
                        <div 
                          ref={photoScrollRef}
                          className="flex h-full items-center gap-2 px-3 overflow-x-auto no-scrollbar scroll-smooth"
                        >
                           {attachments.filter(a => a.file_type === 'image').map((att) => (
                              <div key={att.id} className="flex-shrink-0 relative w-24 h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm group/item">
                                 <img src={att.file_path} alt={att.file_name} className="w-full h-full object-cover" />
                                 <div className="absolute top-1 right-1">
                                    <button 
                                      type="button"
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteAttachment(att.id, att.file_path); }}
                                      className="p-1.5 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition-colors"
                                      title="Eliminar Foto"
                                    >
                                       <Trash2 className="h-3 w-3" />
                                    </button>
                                 </div>
                                 <a href={att.file_path} target="_blank" rel="noopener noreferrer" className="absolute bottom-1 right-1 p-1 bg-zinc-900/40 hover:bg-zinc-900/60 rounded-md text-white opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <ExternalLink className="h-3 w-3" />
                                 </a>
                              </div>
                           ))}
                           {attachments.filter(a => a.file_type === 'image').length === 0 && (
                             <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-zinc-300 uppercase tracking-widest italic pt-1">Sem fotos.</div>
                           )}
                        </div>
                        
                        {/* Carousel Controls */}
                        {attachments.filter(a => a.file_type === 'image').length > 3 && (
                          <>
                            <button 
                              type="button"
                              onClick={() => photoScrollRef.current?.scrollBy({ left: -100, behavior: 'smooth' })}
                              className="absolute left-0 top-1/2 -translate-y-1/2 p-1 bg-white/80 dark:bg-zinc-900/80 shadow-md rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <ChevronLeft className="h-3 w-3 text-zinc-600" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => photoScrollRef.current?.scrollBy({ left: 100, behavior: 'smooth' })}
                              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-white/80 dark:bg-zinc-900/80 shadow-md rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <ChevronRight className="h-3 w-3 text-zinc-600" />
                            </button>
                          </>
                        )}
                     </div>
                  </div>

                  {/* DOCUMENTOS SECTION */}
                  <div className="flex flex-col min-w-0 h-full">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">DOCUMENTOS ({attachments.filter(a => a.file_type !== 'image').length})</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => { if(!formData.omatapalo_code) { alert("Introduza o código antes."); return; } setUploading("Documentos"); fileInputRef.current?.click(); }}
                          className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-green-100 transition-colors"
                        >
                           {uploading === "Documentos" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-2.5 w-2.5" />}
                           DOCUMENTO
                        </button>
                     </div>

                     <div className="h-[110px] bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl overflow-y-scroll custom-scrollbar p-2 space-y-1.5">
                        {attachments.filter(a => a.file_type !== 'image').map((att) => (
                           <div key={att.id} className="group/doc flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                              <div className="flex items-center gap-2 min-w-0">
                                 <FileText className="h-3 w-3 text-zinc-400" />
                                 <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300 truncate uppercase">{att.file_name}</span>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                 <a href={att.file_path} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-blue-600">
                                    <ExternalLink className="h-3 w-3" />
                                 </a>
                                 <button 
                                   type="button"
                                   onClick={() => handleDeleteAttachment(att.id, att.file_path)}
                                   className="p-1 bg-red-50 text-red-400 hover:bg-red-100 rounded transition-colors"
                                   title="Eliminar Documento"
                                 >
                                    <Trash2 className="h-3 w-3" />
                                 </button>
                              </div>
                           </div>
                        ))}
                        {attachments.filter(a => a.file_type !== 'image').length === 0 && (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-zinc-300 uppercase tracking-widest italic pt-3">Sem documentos.</div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </form>

        <div className="px-10 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic">* CAMPOS OBRIGATÓRIOS</span>
          <div className="flex items-center gap-8">
            <button type="button" onClick={() => onClose()} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900">CANCELAR</button>
            <button 
              type="submit" 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.1em] shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-30"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "GUARDAR ALTERAÇÕES"}
            </button>
          </div>
        </div>
      </div>

      {isBrandModalOpen && <BrandFormModal onClose={(nb) => { setIsBrandModalOpen(false); if (nb) loadMasterData(); }} />}
      {isHierarchyModalOpen && <HierarchyManagerModal onClose={() => { setIsHierarchyModalOpen(false); loadMasterData(); }} />}
    </div>
  );
}
