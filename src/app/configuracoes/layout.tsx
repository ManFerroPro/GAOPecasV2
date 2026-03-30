"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Database, Settings, LayoutGrid, MapPin, ShieldCheck } from "lucide-react";

const sidebarNavItems = [
  { name: "Resumo", href: "/configuracoes", icon: LayoutGrid },
  { name: "Usuários", href: "/configuracoes/usuarios", icon: Users },
  { name: "Delegações", href: "/configuracoes/delegacoes", icon: MapPin },
  { name: "Perfis", href: "/configuracoes/perfis", icon: ShieldCheck },
  { name: "Hierarquias", href: "/configuracoes/hierarquias", icon: Database },
  { name: "Geral", href: "/configuracoes/geral", icon: Settings },
];

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-zinc-50 dark:bg-zinc-950/50 dark:border-zinc-800 flex flex-col pt-8 px-6 space-y-8">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 pl-4 mb-4">Administração</h2>
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest group",
                    isActive
                      ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-500 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 border border-zinc-100 dark:border-zinc-800"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-900/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1" />

        <div className="pb-8 pl-4">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
            Painel de Administração<br />
            <span className="text-blue-600/50">GAO PEÇAS V2.0</span>
          </p>
        </div>
      </aside>

      {/* Content area */}
      <main className="flex-1 overflow-auto bg-white dark:bg-zinc-950 p-10 animate-in fade-in slide-in-from-left-4 duration-500">
        {children}
      </main>
    </div>
  );
}
