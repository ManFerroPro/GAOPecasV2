"use client";

import { useState, useEffect } from "react";
import { Shield, ShieldCheck, Mail, Calendar, MapPin, Search, Plus, MoreHorizontal, Check, Edit2, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAppRoles } from "@/app/configuracoes/actions";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await getAppRoles();
        setRoles(data);
      } catch (error) {
        console.error("Failed to load roles", error);
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    role.scope.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">Perfis & Permissões</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Configurar as funções disponíveis no sistema.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:translate-y-1">
          <Plus className="h-4 w-4" />
          Novo Perfil
        </button>
      </header>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="PROCURAR POR NOME OU ÂMBITO..."
            className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 outline-none focus:border-blue-600/30 dark:focus:border-blue-500/30 transition-all font-black uppercase text-[11px] tracking-widest shadow-inner shadow-zinc-200/50 dark:shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
             <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
             <span className="ml-3 text-[10px] font-black uppercase text-zinc-400 tracking-widest">A carregar perfis...</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div 
              key={role.id} 
              className="group p-8 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:border-blue-600/20 transition-all duration-300 relative overflow-hidden flex flex-col"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-blue-600 transition-colors rounded-2xl">
                  <Shield className="h-6 w-6" />
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                  role.scope === "Master" 
                    ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50" 
                    : "bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700"
                )}>
                  {role.scope}
                </div>
              </div>
              
              <div className="space-y-2 mb-6 flex-1">
                <h3 className="text-xl font-black uppercase tracking-tighter leading-tight">{role.name}</h3>
                <p className="text-[11px] font-bold text-zinc-400 leading-relaxed italic">{role.description || "Sem descrição disponível."}</p>
              </div>

              <div className="pt-6 border-t border-zinc-50 dark:border-zinc-800 flex justify-between items-center mt-auto">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate max-w-[150px]">UID: {role.id}</span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-600 transition-colors">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-zinc-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 mt-8">
          <div className="flex items-start gap-6">
             <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
             </div>
             <div>
                <h3 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100">Controlo de Acesso Baseado em Atributos (ABAC)</h3>
                <p className="text-[12px] font-bold text-zinc-400 mt-2 max-w-2xl">
                  O sistema utiliza um modelo de permissões híbrido onde o perfil de **Administrador** é global, 
                  enquanto as outras funções são atribuídas especificamente a cada delegação. 
                  A delegação **"Central de Peças"** possui perfis exclusivos para a gestão logística central.
                </p>
             </div>
          </div>
      </div>
    </div>
  );
}
