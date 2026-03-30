"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Building2, 
  ChevronRight,
  Edit2,
  Trash2,
  Map,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import DelegationFormModal from "@/components/configuracoes/DelegationFormModal";
import { getDelegations, upsertDelegation, deleteDelegation } from "@/app/configuracoes/actions";

export default function DelegationsPage() {
  const [delegations, setDelegations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDelegation, setEditingDelegation] = useState<any>(null);

  useEffect(() => {
    loadDelegations();
  }, []);

  async function loadDelegations() {
    setLoading(true);
    try {
      const data = await getDelegations();
      setDelegations(data);
    } catch (err) {
      console.error("Failed to load delegations:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredDelegations = delegations.filter(del => 
    del.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    del.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrUpdate = async (delData: any) => {
    try {
      setLoading(true);
      await upsertDelegation(delData);
      await loadDelegations();
      setIsModalOpen(false);
      setEditingDelegation(null);
    } catch (err) {
      alert("Erro ao guardar delegação: " + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem a certeza que deseja eliminar a delegação ${name}?`)) {
      try {
        setLoading(true);
        await deleteDelegation(id);
        await loadDelegations();
      } catch (err) {
        alert("Erro ao eliminar: " + (err as any).message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && delegations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">A carregar delegações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">Delegações</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Gerir os locais de operação e pedidos.</p>
        </div>
        <button 
          onClick={() => { setEditingDelegation(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:translate-y-1"
        >
          <Plus className="h-4 w-4" />
          Nova Delegação
        </button>
      </header>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="PROCURAR POR NOME OU CÓDIGO..."
            className="w-full pl-12 pr-6 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 outline-none focus:border-blue-600/30 dark:focus:border-blue-500/30 transition-all font-black uppercase text-[11px] tracking-widest shadow-inner shadow-zinc-200/50 dark:shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Delegations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
         {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
             <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        )}
        {filteredDelegations.map((del) => (
          <div 
            key={del.id} 
            className="group p-8 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:border-blue-600/20 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                <Building2 className="h-6 w-6" />
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                del.status === "Ativo" 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50" 
                  : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/50"
              )}>
                {del.status}
              </div>
            </div>
            
            <div className="space-y-1 mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter leading-tight flex items-center gap-2">
                {del.name}
                {del.is_master && <span className="text-[8px] px-2 py-0.5 bg-blue-600 text-white rounded font-black tracking-widest">MASTER</span>}
              </h3>
              <p className="text-[10px] font-black text-blue-600 tracking-widest">{del.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Utilizadores</span>
                <p className="text-[14px] font-black text-zinc-900 dark:text-zinc-100">{del.usersCount || 0}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Localização</span>
                <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {del.address || "Sem endereço"}
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center">
              <button className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">
                <Map className="h-3 w-3" />
                Ver no Mapa
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingDelegation(del); setIsModalOpen(true); }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(del.id, del.name)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDelegations.length === 0 && !loading && (
        <div className="p-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] italic">Nenhuma delegação encontrada.</p>
        </div>
      )}

      {isModalOpen && (
        <DelegationFormModal 
          initialData={editingDelegation} 
          onClose={(data) => {
            if (data) handleCreateOrUpdate(data);
            else { setIsModalOpen(false); setEditingDelegation(null); }
          }} 
        />
      )}
    </div>
  );
}
