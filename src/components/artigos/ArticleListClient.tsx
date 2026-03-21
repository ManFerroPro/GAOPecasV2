"use client";

import { useState } from "react";
import { Search, Filter, Plus, Edit2, Trash2, Loader2, MessageSquare, Image, Paperclip, Upload, X, MoreVertical } from "lucide-react";
import ArticleFormModal from "./ArticleFormModal";
import BulkImportModal from "./BulkImportModal";
import ArticleCommentsPanel from "./ArticleCommentsPanel";
import { deleteArticle } from "@/app/artigos/actions";
import { cn } from "@/lib/utils";

interface ArticleListClientProps {
  initialItems: any[];
}

export default function ArticleListClient({ initialItems }: ArticleListClientProps) {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(initialItems[0] || null);
  const [overlayType, setOverlayType] = useState<'images' | 'docs' | null>(null);
  const [openMenuCode, setOpenMenuCode] = useState<string | null>(null);

  const isAdmin = true; 

  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesMain = 
      item.omatapalo_code.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.family_name?.toLowerCase().includes(term) ||
      item.sub_family_name?.toLowerCase().includes(term);
    
    const matchesPN = item.item_part_numbers?.some((pn: any) => 
      pn.part_number.toLowerCase().includes(term) ||
      pn.brand_name?.toLowerCase().includes(term)
    );

    return matchesMain || matchesPN;
  });

  const handleDelete = async (code: string) => {
    if (!confirm("⚠️ Eliminar artigo?")) return;
    setIsDeleting(code);
    try {
      await deleteArticle(code);
      setItems(items.filter(i => i.omatapalo_code !== code));
      if (selectedItem?.omatapalo_code === code) setSelectedItem(null);
    } catch (error) {
       alert("Erro.");
    } finally {
      setIsDeleting(null);
      setOpenMenuCode(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden bg-white dark:bg-zinc-950 font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-10 pt-6 pb-10 overflow-hidden">
        <header className="mb-6">
          <h1 className="text-5xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100 leading-none">Artigos</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-0.5">Gestão de Artigos</p>
        </header>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
            <input 
              type="text" 
              placeholder="PESQUISAR CÓDIGO, DESCRIÇÃO OU PART-NUMBER..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all text-[11px] font-bold uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 transition-all">
            <Filter className="h-4 w-4 text-zinc-500" />
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 border-2 border-zinc-900 dark:border-zinc-100 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              Importar
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] hover:bg-blue-700 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Artigo
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-3xl border-2 border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 bg-white dark:bg-zinc-900 border-b-2 border-zinc-100 dark:border-zinc-800 z-10">
              <tr className="text-[9px] uppercase font-black text-zinc-400 tracking-[0.2em]">
                <th className="px-8 py-4 w-[160px]">Codificação</th>
                <th className="px-8 py-4 w-[200px]">Hierarquia</th>
                <th className="px-8 py-4">Descrição & Referências do Fabricante</th>
                <th className="px-8 py-4 w-[80px] text-right">UN</th>
                <th className="px-8 py-4 w-[80px] text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 border-zinc-100 dark:border-zinc-800 overflow-visible">
              {filteredItems.map((item) => (
                <tr 
                  key={item.omatapalo_code} 
                  className={cn(
                    "hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group cursor-pointer",
                    selectedItem?.omatapalo_code === item.omatapalo_code && "bg-zinc-50 dark:bg-zinc-900"
                  )}
                  onClick={() => { setSelectedItem(item); setOpenMenuCode(null); }}
                >
                  <td className="px-8 py-5 align-top">
                    <div className="space-y-3">
                      <span className="font-mono font-black text-blue-600 dark:text-blue-500 text-[14px] tracking-[0.15em]">
                        {item.omatapalo_code}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.item_attachments?.some((a:any) => a.file_type === 'image') && (
                          <button onClick={(e) => { e.stopPropagation(); setOverlayType('images'); }} className="text-blue-500 hover:scale-110 transition-all"><Image className="h-3.5 w-3.5" /></button>
                        )}
                        {item.item_attachments?.some((a:any) => a.file_type === 'document') && (
                          <button onClick={(e) => { e.stopPropagation(); setOverlayType('docs'); }} className="text-green-600 hover:scale-110 transition-all"><Paperclip className="h-3.5 w-3.5" /></button>
                        )}
                        {(item.item_comments_count > 0) && (
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-top">
                    <div className="space-y-0.5">
                      <span className="text-zinc-400 font-black uppercase text-[8px] tracking-widest">{item.family_name}</span>
                      <p className="text-[10px] text-zinc-900 dark:text-zinc-200 font-bold uppercase truncate">{item.sub_family_name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-top">
                    <div className="space-y-3">
                      <span className="font-black text-zinc-900 dark:text-zinc-100 text-[13px] uppercase leading-tight tracking-tight block">
                        {item.description}
                      </span>
                      {item.item_part_numbers?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.item_part_numbers.map((pn: any) => (
                            <span key={pn.id} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 border border-zinc-200/50 transition-all hover:border-zinc-300">
                               <span className="opacity-40 font-black italic">{pn.brand_name}</span>
                               <span className="text-zinc-800 dark:text-zinc-200">{pn.part_number}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 align-top text-right">
                    <span className="font-black text-[10px] text-zinc-400 uppercase">{item.unit || "UN"}</span>
                  </td>
                  <td className="px-8 py-5 text-right align-top relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setOpenMenuCode(openMenuCode === item.omatapalo_code ? null : item.omatapalo_code)}
                      className="p-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {openMenuCode === item.omatapalo_code && (
                      <div className="absolute right-8 top-12 w-40 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[50] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                         <button 
                           onClick={() => { setEditingItem(item); setIsModalOpen(true); setOpenMenuCode(null); }}
                           className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                         >
                           <Edit2 className="h-3.5 w-3.5" />
                           Editar
                         </button>
                         {isAdmin && (
                           <button 
                             onClick={() => handleDelete(item.omatapalo_code)}
                             className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-zinc-50 dark:border-zinc-800"
                           >
                             <Trash2 className="h-3.5 w-3.5" />
                             Eliminar
                           </button>
                         )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar: Integrated Comments */}
      <div className="w-[380px] border-l border-zinc-100 dark:border-zinc-800 h-full bg-zinc-50/30 dark:bg-zinc-950/20">
        <ArticleCommentsPanel itemCode={selectedItem?.omatapalo_code || null} />
      </div>

      {/* Overlays */}
      {overlayType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <button onClick={() => setOverlayType(null)} className="absolute top-10 right-10 text-white hover:scale-110 transition-all"><X className="h-8 w-8" /></button>
          <div className="text-center text-white p-16 border border-white/10 rounded-3xl bg-zinc-900 shadow-2xl">
             <h3 className="text-2xl font-black uppercase mb-2 tracking-tighter">{overlayType === 'images' ? 'Galeria' : 'Documentação'}</h3>
             <p className="opacity-30 text-xs italic uppercase tracking-widest font-bold">Acesso via OneDrive em breve.</p>
          </div>
        </div>
      )}

      {isModalOpen && <ArticleFormModal initialData={editingItem} onClose={(s) => { setIsModalOpen(false); setEditingItem(null); if (s) window.location.reload(); }} />}
      {isBulkModalOpen && <BulkImportModal onClose={(s) => { setIsBulkModalOpen(false); if (s) window.location.reload(); }} />}
    </div>
  );
}
