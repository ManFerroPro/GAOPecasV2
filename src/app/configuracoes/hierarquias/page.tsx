"use client";

import { useState } from "react";
import { 
  Database, 
  Box, 
  Truck, 
  Plus, 
  Search, 
  ChevronRight,
  Settings2,
  Trash2,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "artigos" | "equipamentos";

export default function HierarchyHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>("artigos");

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">Gestão de Hierarquias</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Configurar famílias, marcas e categorias de mestre.</p>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-inner shadow-zinc-200/50 dark:shadow-none">
          <button 
            onClick={() => setActiveTab("artigos")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "artigos" 
                ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-xl shadow-zinc-200/50 dark:shadow-none translate-y-[-1px] border border-zinc-100 dark:border-zinc-800" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <Box className="h-3.5 w-3.5" />
            Artigos
          </button>
          <button 
            onClick={() => setActiveTab("equipamentos")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "equipamentos" 
                ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-xl shadow-zinc-200/50 dark:shadow-none translate-y-[-1px] border border-zinc-100 dark:border-zinc-800" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <Truck className="h-3.5 w-3.5" />
            Equipamentos
          </button>
        </div>
      </header>

      {activeTab === "artigos" ? <ArtigosHierarchy /> : <EquipamentosHierarchy />}
    </div>
  );
}

function ArtigosHierarchy() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
      <SectionCard 
        title="Famílias & Subfamílias" 
        subtitle="Estrutura de classificação principal." 
        icon={Box}
        items={[
          { name: "CONSUMÍVEIS", count: 12, secondary: "Óleos, Filtros, etc." },
          { name: "PEÇAS DE DESGASTE", count: 8, secondary: "Lâminas, Unhas, etc." },
          { name: "SISTEMA ELÉTRICO", count: 15, secondary: "Baterias, Alternadores..." },
        ]}
      />
      <SectionCard 
        title="Marcas de Artigos" 
        subtitle="Gestão de fabricantes e distribuidores." 
        icon={Settings2}
        items={[
          { name: "CATERPILLAR", count: 450, secondary: "Premium OEM" },
          { name: "KOMATSU", count: 320, secondary: "Premium OEM" },
          { name: "DONALDSON", count: 85, secondary: "Filtração" },
        ]}
      />
    </div>
  );
}

function EquipamentosHierarchy() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
      <SectionCard 
        title="Tipos & Categorias" 
        subtitle="Classificação técnica de frotas." 
        icon={Truck}
        items={[
          { name: "PESADOS", count: 5, secondary: "Dumpers, Escavadoras..." },
          { name: "LIGEIROS", count: 3, secondary: "Pick-ups, Carrinhas..." },
          { name: "GERADORES", count: 2, secondary: "Grupos Geradores" },
        ]}
      />
      <SectionCard 
        title="Marcas & Modelos" 
        subtitle="Especificações por fabricante." 
        icon={Database}
        items={[
          { name: "TOYOTA", count: 12, secondary: "HILUX, LAND CRUISER..." },
          { name: "VOLVO", count: 8, secondary: "A40G, EC480D..." },
          { name: "SDLG", count: 4, secondary: "LG956L..." },
        ]}
      />
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, items }: { title: string; subtitle: string; icon: any; items: any[] }) {
  return (
    <div className="flex flex-col rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden group">
      <div className="p-8 border-b-2 border-zinc-50 dark:border-zinc-800 flex items-start justify-between">
        <div>
          <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{subtitle}</p>
        </div>
        <button className="p-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition-all">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group/item">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 leading-none">{item.name}</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{item.secondary}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 tabular-nums">
                {item.count}
              </span>
              <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-400">
                  <Edit2 className="h-3 w-3" />
                </button>
                <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-zinc-400 hover:text-red-600">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-200 group-hover/item:text-blue-600 transition-colors ml-2" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 flex items-center justify-center border-t-2 border-zinc-100 dark:border-zinc-800">
        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
          Ver todas as definições
        </button>
      </div>
    </div>
  );
}
