"use client";

import { useState } from "react";
import { 
  Settings, 
  Palette, 
  Image as ImageIcon, 
  Shield, 
  Globe, 
  Cloud,
  Check,
  Save,
  RotateCcw,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GeneralSettingsPage() {
  const [appName, setAppName] = useState("GAO Peças");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">Configurações Gerais</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Configurar a identidade e o comportamento global do sistema.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setAppName("GAO Peças"); setPrimaryColor("#2563eb"); }}
            className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl hover:text-zinc-900 dark:hover:text-zinc-100 transition-all border border-zinc-200 dark:border-zinc-700 active:scale-95 duration-200 shadow-sm"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                A Guardar...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Alterações
              </>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Visual Identity Section */}
        <div className="md:col-span-2 space-y-6">
          <SectionCard title="Identidade Visual" icon={Palette}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Nome da Aplicação</label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 outline-none focus:border-blue-600/30 dark:focus:border-blue-500/30 transition-all font-black uppercase text-[12px] tracking-widest text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1 flex items-center gap-2">
                    <Sun className="h-3 w-3 text-amber-500" />
                    Cor do Tema (Dia)
                  </label>
                  <div className="flex gap-4">
                    <div 
                      className="h-14 w-14 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 shadow-lg cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <input 
                      type="text" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-6 py-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 outline-none focus:border-blue-600/30 dark:focus:border-blue-500/30 transition-all font-mono text-[14px] font-bold text-zinc-600 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1 flex items-center gap-2">
                    <Moon className="h-3 w-3 text-blue-400" />
                    Cor do Tema (Noite)
                  </label>
                  <div className="flex gap-4">
                    <div 
                      className="h-14 w-14 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 shadow-lg cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: "#3b82f6" }}
                    />
                    <input 
                      type="text" 
                      defaultValue="#3B82F6"
                      className="flex-1 px-6 py-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 outline-none focus:border-blue-600/30 dark:focus:border-blue-500/30 transition-all font-mono text-[14px] font-bold text-zinc-600 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-4 bg-zinc-50/50 dark:bg-zinc-950/20 group hover:bg-blue-50/50 dark:hover:bg-blue-900/5 transition-all cursor-pointer">
                <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-8 w-8 text-zinc-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-tighter">Logótipo da Empresa</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">PNG, SVG OU JPG ATÉ 5MB</p>
                </div>
                <button className="px-6 py-2 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl font-black uppercase text-[9px] tracking-widest text-zinc-400 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors">Selecionar Ficheiro</button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Configurações de Rede" icon={Globe}>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 group cursor-pointer hover:border-blue-600/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Cloud className="h-4 w-4 text-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Supabase DB</p>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Estado: Ligado</p>
              </div>
              <div className="p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 group cursor-pointer hover:border-orange-600/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Azure AD Sync</p>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Active (32 users)</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              Estado do Sistema
            </h3>
            <div className="space-y-6">
              {[
                { label: "Versão", value: "2.4.15-PRO" },
                { label: "Ambiente", value: "PRODUÇÃO" },
                { label: "Uptime", value: "99.98%" },
                { label: "Tenant ID", value: "OMAT-PL-01" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.label}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="p-8 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-zinc-50 dark:border-zinc-800">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-[18px] font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}
