"use client";

import { Search, Filter, Plus, Edit2, Trash2, Loader2, MessageSquare, Image, Paperclip, Upload, X, MoreVertical, ExternalLink, FileText } from "lucide-react";
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [searchCode, setSearchCode] = useState("");
  const [searchHierarchy, setSearchHierarchy] = useState("");
  const [searchDesc, setSearchDesc] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [overlayType, setOverlayType] = useState<'images' | 'docs' | null>(null);
  const [openMenuCode, setOpenMenuCode] = useState<string | null>(null);
  const router = useRouter();

  // Sync state with server-side data when it's refreshed
  useEffect(() => {
    setItems(initialItems);
    // Also update selected item if it exists and changed
    if (selectedItem) {
      const updated = initialItems.find(i => i.omatapalo_code === selectedItem.omatapalo_code);
      if (updated) setSelectedItem(updated);
    }
  }, [initialItems]);

  const isAdmin = true;

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

  const filteredItems = items.filter(item => {
    const codeMatch = item.omatapalo_code.toLowerCase().includes(searchCode.toLowerCase());

    const hierarchyMatch =
      item.family_name?.toLowerCase().includes(searchHierarchy.toLowerCase()) ||
      item.sub_family_name?.toLowerCase().includes(searchHierarchy.toLowerCase());

    const descMatch =
      item.description.toLowerCase().includes(searchDesc.toLowerCase()) ||
      item.item_part_numbers?.some((pn: any) =>
        pn.part_number.toLowerCase().includes(searchDesc.toLowerCase()) ||
        pn.brand_name?.toLowerCase().includes(searchDesc.toLowerCase())
      );

    return codeMatch && hierarchyMatch && descMatch;
  }).sort((a, b) => a.omatapalo_code.localeCompare(b.omatapalo_code, undefined, { numeric: true, sensitivity: 'base' }));

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-8 bg-white dark:bg-zinc-950 font-sans overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pt-3 pb-6 overflow-hidden">
        <header className="px-6 mb-4 flex-shrink-0">
          <h1 className="text-[2.5rem] font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100 leading-none">Artigos</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-0.5">Gestão de Artigos</p>
        </header>

        <div className="px-6 flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="relative w-48">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
            <input
              type="text"
              placeholder="Artigo"
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all text-[11px] font-bold uppercase shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/20"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
          </div>
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
            <input
              type="text"
              placeholder="FAMÍLIA / SUBFAMÍLIA"
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all text-[11px] font-bold uppercase shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/20"
              value={searchHierarchy}
              onChange={(e) => setSearchHierarchy(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
            <input
              type="text"
              placeholder="DESCRIÇÃO / PART-NUMBER..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all text-[11px] font-bold uppercase shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/20"
              value={searchDesc}
              onChange={(e) => setSearchDesc(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setSearchCode(""); setSearchHierarchy(""); setSearchDesc(""); }}
            className="p-3 bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
            title="LIMPAR FILTROS"
          >
            <X className="h-4 w-4 text-white stroke-[4]" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 border-2 border-zinc-900 dark:border-zinc-100 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/20"
            >
              <Upload className="h-3.5 w-3.5" />
              Importar
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Artigo
            </button>
          </div>
        </div>

        <div className="px-6 flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
          <div className="flex-1 overflow-auto rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/40 bg-white dark:bg-zinc-900">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10 shadow-[0_2px_0_0_rgba(228,228,231,1)] dark:shadow-[0_2px_0_0_rgba(39,39,42,1)]">
                <tr className="text-[9px] uppercase font-black text-zinc-600 dark:text-zinc-400 tracking-[0.2em]">
                  <th className="px-8 py-4 w-[160px]">Artigo</th>
                  <th className="px-8 py-4 w-[200px]">FAMÍLIA / SUBFAMÍLIA</th>
                  <th className="px-8 py-4">Descrição & Referências do Fabricante</th>
                  <th className="px-8 py-4 w-[80px] text-right">UN</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-zinc-100 dark:border-zinc-800 overflow-visible">
                {filteredItems.map((item) => (
                  <ArticleRow
                    key={item.omatapalo_code}
                    item={item}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    setEditingItem={setEditingItem}
                    setIsModalOpen={setIsModalOpen}
                    handleDelete={handleDelete}
                    overlayType={overlayType}
                    setOverlayType={setOverlayType}
                    openMenuCode={openMenuCode}
                    setOpenMenuCode={setOpenMenuCode}
                    isAdmin={isAdmin}
                    isDeleting={isDeleting === item.omatapalo_code}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sidebar: Integrated Comments */}
      <div className="w-[380px] border-l border-zinc-100 dark:border-zinc-800 h-full bg-zinc-50/30 dark:bg-zinc-950/20">
        <ArticleCommentsPanel
          itemCode={selectedItem?.omatapalo_code}
          itemName={selectedItem?.description || ""}
        />
      </div>

      {/* Overlays */}
      {overlayType && selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <button onClick={(e) => { e.stopPropagation(); setOverlayType(null); }} className="absolute top-10 right-10 text-white hover:scale-110 transition-all"><X className="h-8 w-8" /></button>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter">
                {overlayType === 'images' ? 'Galeria FOTOGRÁFICA' : 'DOCUMENTOS'} - <span className="text-blue-600">{selectedItem.omatapalo_code}</span>
              </h3>
            </div>

            <div className="p-8 overflow-y-auto">
              {overlayType === 'images' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {selectedItem.item_attachments?.filter((a: any) => a.file_type === 'image').map((att: any) => (
                    <a key={att.id} href={att.file_path} target="_blank" rel="noopener noreferrer" className="block relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group">
                      <img src={att.file_path} alt={att.file_name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <ExternalLink className="text-white opacity-0 group-hover:opacity-100 h-8 w-8 transition-all" />
                      </div>
                    </a>
                  ))}
                  {!selectedItem.item_attachments?.some((a: any) => a.file_type === 'image') && (
                    <div className="col-span-full py-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Sem fotos.</div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedItem.item_attachments?.filter((a: any) => a.file_type === 'document').map((att: any) => (
                    <a key={att.id} href={att.file_path} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors uppercase">{att.file_name}</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                    </a>
                  ))}
                  {!selectedItem.item_attachments?.some((a: any) => a.file_type === 'document') && (
                    <div className="py-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Sem documentos.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <ArticleFormModal initialData={editingItem} onClose={(s) => { setIsModalOpen(false); setEditingItem(null); if (s) router.refresh(); }} />}
      {isBulkModalOpen && <BulkImportModal onClose={(s) => { setIsBulkModalOpen(false); if (s) router.refresh(); }} />}
    </div>
  );
}

function ArticleRow({
  item, selectedItem, setSelectedItem, setEditingItem, setIsModalOpen, handleDelete,
  overlayType, setOverlayType, openMenuCode, setOpenMenuCode, isAdmin, isDeleting
}: any) {
  const noteRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    if (noteRef.current) {
      setIsTruncated(noteRef.current.scrollWidth > noteRef.current.clientWidth);
    }
  }, [item.internal_notes]);

  return (
    <tr
      key={item.omatapalo_code}
      className={cn(
        "hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group cursor-pointer",
        selectedItem?.omatapalo_code === item.omatapalo_code && "bg-zinc-50 dark:bg-zinc-900"
      )}
      onClick={() => { setSelectedItem(item); setOpenMenuCode(null); }}
      onDoubleClick={() => { setEditingItem(item); setIsModalOpen(true); }}
    >
      <td className="px-8 py-5 align-top">
        <div className="space-y-3">
          <span className="font-mono font-black text-blue-600 dark:text-blue-500 text-[14px] tracking-[0.15em]">
            {item.omatapalo_code}
          </span>
          <div className="flex items-center gap-2">
            {item.item_attachments?.some((a: any) => a.file_type === 'image') && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setOverlayType('images'); }} className="text-blue-500 hover:scale-110 transition-all"><Image className="h-5 w-5" /></button>
            )}
            {item.item_attachments?.some((a: any) => a.file_type === 'document') && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setOverlayType('docs'); }} className="text-green-600 hover:scale-110 transition-all"><Paperclip className="h-5 w-5" /></button>
            )}
            {(item.item_comments_count > 0) && (
              <MessageSquare className="h-5 w-5 text-amber-500" />
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
        <div className="space-y-1">
          <span className="font-black text-zinc-900 dark:text-zinc-100 text-[13px] uppercase leading-tight tracking-tight block">
            {item.description}
          </span>

          {item.internal_notes && (
            <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 overflow-hidden">
              <span className="text-orange-600 font-black italic whitespace-nowrap">OBS:</span>
              <span ref={noteRef} className="truncate flex-1 font-medium italic">{item.internal_notes}</span>
              {isTruncated && (
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsModalOpen(true); }}
                  className="text-[9px] font-black text-blue-600 hover:underline whitespace-nowrap ml-1"
                >
                  ... VER MAIS
                </button>
              )}
            </div>
          )}

          {item.item_part_numbers?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {item.item_part_numbers.map((pn: any) => (
                <span key={pn.id} className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 border border-zinc-200/50 transition-all hover:border-zinc-300">
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
    </tr>
  );
}
