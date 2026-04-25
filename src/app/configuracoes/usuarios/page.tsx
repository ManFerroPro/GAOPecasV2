"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  X,
  Shield, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  MapPin, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Check, 
  Edit2, 
  Trash2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import UserFormModal from "@/components/configuracoes/UserFormModal";
import { getUsersWithPermissions, upsertUserWithPermissions, deleteUser } from "@/app/configuracoes/actions";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsersWithPermissions();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.permissions.some((p: any) => p.delegation.toLowerCase().includes(searchTerm.toLowerCase()) || p.roles.some((r: string) => r.toLowerCase().includes(searchTerm.toLowerCase())));
    
    if (activeFilter === "Admin") return matchesSearch && user.isAdmin;
    if (activeFilter === "Inativos") return matchesSearch && user.status === "Inativo";
    return matchesSearch;
  });

  const handleCreateOrUpdate = async (userData: any) => {
    try {
      setLoading(true);
      const res = await upsertUserWithPermissions(userData);
      if (res?.error) {
        alert("Erro ao guardar utilizador: " + res.error);
        return;
      }
      await loadUsers();
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      alert("Erro ao guardar utilizador: " + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem a certeza que deseja eliminar o utilizador ${name}?`)) {
      try {
        setLoading(true);
        await deleteUser(id);
        await loadUsers();
        setOpenMenuId(null);
      } catch (err) {
        alert("Erro ao eliminar: " + (err as any).message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">A carregar utilizadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">Gestão de Utilizadores</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Sincronizado com a base de dados em tempo real.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:translate-y-1"
        >
          <Plus className="h-4 w-4" />
          Novo Utilizador
        </button>
      </header>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="PROCURAR POR NOME, EMAIL OU PERFIL..."
            className="w-full pl-12 pr-6 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 outline-none focus:border-blue-600/30 dark:focus:border-blue-500/30 transition-all font-black uppercase text-[11px] tracking-widest shadow-inner shadow-zinc-200/50 dark:shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-2 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800">
          {["Todos", "Admin", "Inativos"].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                activeFilter === filter ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-600" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-200/50 dark:shadow-none relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
             <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800/50 border-b-2 border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Utilizador</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Perfil Global</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Delegações e Funções</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Último Acesso</th>
              <th className="px-8 py-5 text-right w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-zinc-100 dark:divide-zinc-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-black text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                      {user.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-[13px] font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-tight">{user.name}</p>
                      <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    user.isAdmin 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  )}>
                    {user.isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5 opacity-30" />}
                    {user.isAdmin ? "Administrador" : "Utilizador"}
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex flex-col gap-2 min-w-[250px] items-center">
                    {user.permissions.length === 0 && <span className="text-[9px] font-bold text-zinc-300 italic uppercase">Sem acessos locais</span>}
                    {user.permissions.map((perm: any) => (
                      <div key={perm.delegation} className="flex items-center gap-2 group/entry">
                        <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-black uppercase text-[9px] tracking-widest rounded-lg flex items-center gap-1.5 whitespace-nowrap border border-zinc-200 dark:border-zinc-700">
                          <MapPin className="h-2.5 w-2.5 text-blue-600" />
                          {perm.delegation}
                        </span>
                        <div className="flex gap-1">
                          {perm.roles.map((role: string) => (
                            <span key={role} className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter bg-zinc-100 dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-800">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className={cn(
                    "px-3 py-1.5 inline-flex items-center gap-2 rounded-full text-[9px] font-black uppercase tracking-widest",
                    user.status === "Ativo" 
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50" 
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                  )}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", user.status === "Ativo" ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                    {user.status}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    {user.lastLogin}
                  </p>
                </td>
                <td className="px-8 py-5 text-right relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                    className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-zinc-400"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {/* Actions Dropdown */}
                  {openMenuId === user.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-8 top-16 w-48 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => { setEditingUser(user); setIsModalOpen(true); setOpenMenuId(null); }}
                          className="flex items-center gap-3 w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors underline-none"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.name)}
                          className="flex items-center gap-3 w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-zinc-50 dark:border-zinc-800 underline-none"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="p-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] italic">Nenhum utilizador encontrado com os filtros atuais.</p>
        </div>
      )}

      {isModalOpen && (
        <UserFormModal 
          initialData={editingUser} 
          onClose={(data) => {
            if (data) handleCreateOrUpdate(data);
            else { setIsModalOpen(false); setEditingUser(null); }
          }} 
        />
      )}
    </div>
  );
}
