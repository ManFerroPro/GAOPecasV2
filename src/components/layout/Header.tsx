"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PlusSquare, 
  CheckSquare, 
  ShieldCheck, 
  Truck, 
  ShoppingCart, 
  PackageCheck,
  Box,
  Settings,
  Users,
  Database
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["Administrador", "Utilizador"] },
  { name: "Requisição", href: "/requisicao", icon: PlusSquare, roles: ["Administrador", "Utilizador"] },
  { name: "Validação", href: "/validacao", icon: CheckSquare, roles: ["Administrador"] },
  { name: "Aprovação", href: "/aprovacao", icon: ShieldCheck, roles: ["Administrador"] },
  { name: "Transferências", href: "/transferencias", icon: Truck, roles: ["Administrador", "Utilizador"] },
  { name: "Compras", href: "/compras", icon: ShoppingCart, roles: ["Administrador"] },
  { name: "Receção", href: "/rececao", icon: PackageCheck, roles: ["Administrador", "Utilizador"] },
  { name: "Artigos", href: "/artigos", icon: Box, roles: ["Administrador", "Utilizador"] },
  { name: "Equipamentos", href: "/equipamentos", icon: Truck, roles: ["Administrador", "Utilizador"] },
  { name: "Configurações", href: "/configuracoes", icon: Settings, roles: ["Administrador"] },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/95 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50">
      <div className="flex h-20 items-center px-10 w-full justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Box className="h-8 w-8" />
            </div>
            <span className="text-5xl font-black tracking-tighter text-blue-600 dark:text-blue-500 uppercase whitespace-nowrap">
              GAO PEÇAS
            </span>
          </Link>
          <nav className="hidden xl:flex items-center gap-1">
            {navigation.filter(item => item.roles.includes("Administrador")).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-6 w-[1px] bg-zinc-100 dark:bg-zinc-800 mx-1" />
          <ThemeToggle />
          <div className="flex items-center gap-3 pr-2">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Manuel Ferreira</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Administrador</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black shadow-lg shadow-zinc-500/20">
              MF
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
