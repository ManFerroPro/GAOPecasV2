"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const handleToggle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("light-orange");
    else if (theme === "light-orange") setTheme("dark-orange");
    else setTheme("light");
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative flex items-center justify-center w-9 h-9 overflow-hidden"
      title="Alternar Tema (Dia/Noite e Paletas)"
    >
      <div className={cn("absolute transition-all duration-300", theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-90 opacity-0")}>
        <Sun className="h-5 w-5 text-blue-600" />
      </div>
      <div className={cn("absolute transition-all duration-300", theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0")}>
        <Moon className="h-5 w-5 text-blue-400" />
      </div>
      <div className={cn("absolute transition-all duration-300", theme === "light-orange" ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-90 opacity-0")}>
        <Sun className="h-5 w-5 text-orange-500" />
      </div>
      <div className={cn("absolute transition-all duration-300", theme === "dark-orange" ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0")}>
        <Moon className="h-5 w-5 text-orange-400" />
      </div>
      <span className="sr-only">Alternar tema</span>
    </button>
  );
}
