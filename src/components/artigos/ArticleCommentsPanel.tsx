"use client";

import { useState, useEffect, useRef } from "react";
import { Send, History, MessageSquare, Loader2, Edit2, Trash2, Check, X, Image, Paperclip } from "lucide-react";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";

interface Comment {
  id: string;
  item_code: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface ArticleCommentsPanelProps {
  itemCode: string | null;
  itemName: string;
}

export default function ArticleCommentsPanel({ itemCode, itemName }: ArticleCommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [uploading, setUploading] = useState<"Fotos" | "Documentos" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, getPublicUrl } = useSupabaseStorage();

  useEffect(() => {
    if (itemCode) {
      fetchComments();
    }
  }, [itemCode]);

  const fetchComments = async () => {
    if (!itemCode) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/comments?itemCode=${itemCode}`);
      const data = await response.json();
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "Fotos" | "Documentos") => {
    const file = e.target.files?.[0];
    if (!file || !itemCode) return;

    try {
      setUploading(type);
      
      // Clean itemCode of any quotes
      const cleanItemCode = itemCode.replace(/"/g, '');
      
      // Path format: {itemCode}/{type}/{fileName}
      const timestamp = new Date().getTime();
      const filePath = `${cleanItemCode}/${type}/${timestamp}_${file.name}`;
      
      await uploadFile("artigos", filePath, file);
      const publicUrl = getPublicUrl("artigos", filePath);

      // Add a comment with the link to the file
      const linkText = type === "Fotos" ? "📸 FOTO ADICIONADA" : "📎 DOCUMENTO ADICIONADO";
      const commentContent = `[SISTEMA] ${linkText}: ${file.name}\n${publicUrl}`;
      
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode, content: commentContent }),
      });
      
      fetchComments();
    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMsg = error.message || error.error_description || "Erro desconhecido";
      
      if (errorMsg.includes("bucket not found")) {
        alert("Erro: O bucket 'artigos' não foi encontrado. Por favor, crie o bucket 'artigos' no dashboard do Supabase.");
      } else if (errorMsg.includes("row-level security")) {
        alert("Erro de Permissão (RLS): Precisa de adicionar uma política no Supabase para permitir 'INSERT' no bucket 'artigos'.");
      } else {
        alert(`Falha no upload para o Supabase Storage: ${errorMsg}`);
      }
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !itemCode) return;

    setIsPosting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode, content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText })
      });
      if (response.ok) {
        setEditingId(null);
        fetchComments();
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirmar eliminação?")) return;
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (!itemCode) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-zinc-50 dark:bg-zinc-950 text-center space-y-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/20">
          <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-500 animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-widest">Aguardando Seleção</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest max-w-[170px] leading-relaxed">
            Selecione um código de artigo para ver os comentários e anexos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 animate-in fade-in duration-300 border-l border-zinc-100 dark:border-zinc-800 shadow-[-20px_0_30px_-15px_rgba(0,0,0,0.05)] dark:shadow-[-20px_0_30_30px_-15px_rgba(0,0,0,0.2)]">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-zinc-400 tracking-[0.1em]">
            <MessageSquare className="h-3 w-3" />
            <span>Chat do Artigo</span>
          </div>
          <h2 className="text-sm font-black text-blue-600 dark:text-blue-500 uppercase truncate">
            {itemCode} - {itemName}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-zinc-200" /></div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="group relative space-y-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black uppercase text-zinc-400">{comment.user_name || "Utilizador"}</span>
                <span className="text-[8px] font-bold text-zinc-300">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              
              {editingId === comment.id ? (
                <div className="space-y-1">
                  <textarea className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 text-[11px] outline-none" value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdate(comment.id)} className="p-1.5 bg-green-500 text-white rounded-lg"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-[11px] font-bold leading-snug text-zinc-600 dark:text-zinc-300 relative group-hover:bg-zinc-50 transition-colors">
                  <div className="whitespace-pre-wrap break-words">{comment.content}</div>
                   <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-100 px-1 py-0.5">
                      <button onClick={() => { setEditingId(comment.id); setEditText(comment.content); }} className="p-1 hover:text-blue-600"><Edit2 className="h-3 w-3" /></button>
                      <button onClick={() => handleDelete(comment.id)} className="p-1 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                   </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 p-10 text-center">
             <History className="h-10 w-10 mb-2" />
             <p className="text-[9px] font-black uppercase">Sem histórico</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => handleFileUpload(e, uploading === "Fotos" ? "Fotos" : "Documentos")} 
          />
          <button 
            onClick={() => { setUploading("Fotos"); fileInputRef.current?.click(); }}
            disabled={!!uploading}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800/50 text-[10px] font-black uppercase tracking-widest"
          >
            {uploading === "Fotos" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Image className="h-3.5 w-3.5" />}
            Fotos
          </button>
          <button 
            onClick={() => { setUploading("Documentos"); fileInputRef.current?.click(); }}
            disabled={!!uploading}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-100 transition-all border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest"
          >
            {uploading === "Documentos" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
            Documentos
          </button>
        </div>
        <form onSubmit={handlePost} className="relative">
          <textarea 
            rows={2}
            placeholder="COMENTAR..."
            className="w-full p-4 pr-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-blue-500 text-[10px] font-black uppercase transition-all resize-none"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.toUpperCase())}
          />
          <button disabled={!newComment.trim()} className="absolute bottom-4 right-4 p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:scale-105 transition-all disabled:opacity-30">
            {isPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
