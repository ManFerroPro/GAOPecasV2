"use client";

import { useState } from "react";
import { X, Save, User as UserIcon, Mail, Shield, ShieldCheck, MapPin, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserFormProps {
  initialData?: any;
  onClose: (data?: any) => void;
}

const DELEGATIONS = [
  { name: "Central de Peças", isMaster: true },
  { name: "Luanda", isMaster: false },
  { name: "Lobito", isMaster: false },
  { name: "Lubango", isMaster: false },
  { name: "Benguela", isMaster: false },
  { name: "Huambo", isMaster: false },
];

const STANDARD_ROLES = ["Visualizador", "Requisitante", "Validador"];
const MASTER_ROLES = ["Aprovador", "Transferidor", "Procurement"];

export default function UserFormModal({ initialData, onClose }: UserFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || Math.random().toString(36).substr(2, 9),
    name: initialData?.name || "",
    email: initialData?.email || "",
    isAdmin: initialData?.isAdmin || false,
    status: initialData?.status || "Ativo",
    permissions: initialData?.permissions || [], // [{ delegation: string, roles: string[] }]
    lastLogin: initialData?.lastLogin || "Nunca",
  });

  const toggleDelegation = (delName: string) => {
    setFormData(prev => {
      const exists = prev.permissions.find((p: any) => p.delegation === delName);
      if (exists) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p: any) => p.delegation !== delName)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, { delegation: delName, roles: [] }]
        };
      }
    });
  };

  const toggleRole = (delName: string, role: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((p: any) => {
        if (p.delegation === delName) {
          const roles = p.roles.includes(role)
            ? p.roles.filter((r: string) => r !== role)
            : [...p.roles, role];
          return { ...p, roles };
        }
        return p;
      })
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Por favor preencha os campos obrigatórios.");
      return;
    }
    onClose(formData);
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-4xl overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
                {initialData ? "EDITAR UTILIZADOR" : "NOVO UTILIZADOR"}
              </h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Configurar acessos por delegação e perfil global.</p>
            </div>
          </div>
          <button onClick={() => onClose()} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all border border-zinc-100 dark:border-zinc-700">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
          
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">NOME COMPLETO*</label>
              <input
                required
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600/30 transition-all text-[12px] font-black uppercase tracking-tight"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Manuel Ferreira"
              />
            </div>
            <div className="col-span-1 space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">EMAIL CORPORATIVO*</label>
              <div className="relative">
                <input
                  required
                  type="email"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600/30 transition-all text-[11px] font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@omatapalo.com"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
              </div>
            </div>
            <div className="col-span-1 space-y-1.5">
               <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">PERFIL GLOBAL</label>
               <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAdmin: !formData.isAdmin })}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all group",
                    formData.isAdmin 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30" 
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={cn("h-4 w-4", formData.isAdmin ? "text-white" : "text-zinc-300")} />
                    <span className="text-[11px] font-black uppercase tracking-widest">ADMINISTRADOR</span>
                  </div>
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                    formData.isAdmin ? "bg-white border-white scale-110" : "border-zinc-200"
                  )}>
                    {formData.isAdmin && <Check className="h-3 w-3 text-blue-600 stroke-[4]" />}
                  </div>
               </button>
            </div>
          </div>

          <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                ACESSOS POR DELEGAÇÃO
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {DELEGATIONS.map(del => {
                  const permission = formData.permissions.find((p: any) => p.delegation === del.name);
                  const isSelected = !!permission;
                  const availableRoles = del.isMaster ? MASTER_ROLES : STANDARD_ROLES;

                  return (
                    <div 
                      key={del.name}
                      className={cn(
                        "p-1 rounded-3xl border-2 transition-all duration-300",
                        isSelected 
                          ? "border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5" 
                          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      )}
                    >
                      <div className="flex items-center gap-6 p-3">
                        {/* Delegation Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleDelegation(del.name)}
                          className={cn(
                            "flex items-center gap-4 px-6 py-3 rounded-2xl border-2 transition-all min-w-[220px]",
                            isSelected 
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30" 
                              : "bg-zinc-50 dark:bg-zinc-950 border-transparent text-zinc-400"
                          )}
                        >
                          <div className={cn(
                            "h-5 w-5 rounded flex items-center justify-center border-2 transition-all",
                            isSelected ? "bg-white border-white" : "border-zinc-200"
                          )}>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[5]" />}
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest">{del.name}</span>
                          {del.isMaster && <span className="text-[8px] font-black bg-white/20 px-1.5 py-0.5 rounded ml-auto">MASTER</span>}
                        </button>

                        {/* Roles Selection */}
                        <div className={cn(
                          "flex flex-1 items-center gap-2 transition-all duration-500",
                          isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                        )}>
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-2">PERFIS:</span>
                          <div className="flex flex-wrap gap-2">
                             {availableRoles.map(role => {
                               const isRoleSelected = permission?.roles.includes(role);
                               return (
                                 <button
                                   key={role}
                                   type="button"
                                   onClick={() => toggleRole(del.name, role)}
                                   className={cn(
                                     "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                                     isRoleSelected
                                       ? "bg-white dark:bg-zinc-800 border-emerald-600 text-emerald-600 shadow-sm"
                                       : "bg-zinc-100/50 dark:bg-zinc-800/30 border-transparent text-zinc-400 hover:text-zinc-600"
                                   )}
                                 >
                                   {role}
                                 </button>
                               );
                             })}
                          </div>
                          {isSelected && permission?.roles.length === 0 && (
                            <span className="text-[8px] font-bold text-red-400 uppercase italic ml-auto animate-pulse">Selecione pelo menos um perfil</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 flex-shrink-0">
             <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
               <button type="button" onClick={() => setFormData({...formData, status: "Ativo"})} className={cn("px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all", formData.status === "Ativo" ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>Ativo</button>
               <button type="button" onClick={() => setFormData({...formData, status: "Inativo"})} className={cn("px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all", formData.status === "Inativo" ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>Inativo</button>
             </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => onClose()} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">Cancelar</button>
              <button type="submit" className="flex items-center gap-3 px-10 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:translate-y-1">
                <Save className="h-4 w-4" />
                {initialData ? "GUARDAR ALTERAÇÕES" : "CRIAR UTILIZADOR"}
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
