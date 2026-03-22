"use client";

import { useState, useEffect } from "react";
import { Send, History, MessageSquare, Loader2, User, Edit2, Trash2, Check, X } from "lucide-react";
import { getItemComments, postItemComment } from "@/app/artigos/hierarchy-actions";
import { updateItemComment, deleteItemComment } from "@/app/artigos/comments-actions";
import { cn } from "@/lib/utils";

interface CommentsPanelProps {
  itemCode: string | null;
}

export default function ArticleCommentsPanel({ itemCode }: CommentsPanelProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (itemCode) {
      fetchComments();
    }
  }, [itemCode]);

  const fetchComments = async () => {
    if (!itemCode) return;
    setLoading(true);
    try {
      const data = await getItemComments(itemCode);
      setComments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || !newComment.trim()) return;
    setIsPosting(true);
    try {
      const resp = await postItemComment(itemCode, newComment.trim(), "Manuel Ferreira");
      setComments([...comments, resp]);
      setNewComment("");
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
       const resp = await updateItemComment(id, editText);
       setComments(comments.map(c => c.id === id ? resp : c));
       setEditingId(null);
    } catch (error) {
       alert("Erro.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar?")) return;
    try {
      await deleteItemComment(id);
      setComments(comments.filter(c => c.id !== id));
    } catch (error) {
       alert("Erro.");
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
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 animate-in fade-in duration-300 border-l border-zinc-100 dark:border-zinc-800 shadow-[-20px_0_30px_-15px_rgba(0,0,0,0.05)] dark:shadow-[-20px_0_30px_-15px_rgba(0,0,0,0.2)]">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-zinc-400 tracking-[0.1em]">
            <MessageSquare className="h-3 w-3 text-amber-500" />
            Comentários
          </div>
          <h2 className="text-2xl font-black text-blue-600 dark:text-blue-500 italic uppercase tracking-tighter leading-none">
            {itemCode}
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
                  <textarea className="w-full p-3 rounded-lg border border-zinc-200 bg-zinc-50 text-[11px]" value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdate(comment.id)} className="p-1.5 bg-green-500 text-white rounded"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-zinc-100 rounded"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-[11px] font-bold leading-snug text-zinc-600 dark:text-zinc-300 relative group-hover:bg-zinc-50 transition-colors">
                  {comment.content}
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

      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
        <form onSubmit={handlePost} className="relative">
          <textarea 
            rows={2}
            placeholder="COMENTAR..."
            className="w-full p-4 pr-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-amber-500 text-[10px] font-black uppercase transition-all resize-none"
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
