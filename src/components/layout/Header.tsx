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
  PackageCheck 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Requisição", href: "/requisicao", icon: PlusSquare },
  { name: "Validação", href: "/validacao", icon: CheckSquare },
  { name: "Aprovação", href: "/aprovacao", icon: ShieldCheck },
  { name: "Transferências", href: "/transferencias", icon: Truck },
  { name: "Compras", href: "/compras", icon: ShoppingCart },
  { name: "Receção", href: "/rececao", icon: PackageCheck },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/95 dark:border-zinc-800">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              GAO PEÇAS
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">
            MF
          </div>
        </div>
      </div>
    </header>
  );
}
