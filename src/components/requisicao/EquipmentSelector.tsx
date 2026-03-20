"use client";

import { useState } from "react";
import { Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  observations: string;
}

const MOCK_EQUIPMENT: Equipment[] = [
  { id: "EQ-001", name: "Escavadora CAT 320", brand: "Caterpillar", model: "320", observations: "Necessita de revisão hidráulica em breve." },
  { id: "EQ-002", name: "Bulldozer D6", brand: "Caterpillar", model: "D6", observations: "Lâmina substituída recentemente." },
  { id: "EQ-003", name: "Camião Volvo FMX", brand: "Volvo", model: "FMX", observations: "Pneus traseiros novos." },
];

export default function EquipmentSelector({ onSelect }: { onSelect: (eq: Equipment) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Equipment | null>(null);

  const filtered = MOCK_EQUIPMENT.filter(eq => 
    eq.name.toLowerCase().includes(query.toLowerCase()) || 
    eq.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Pesquisar Equipamento (Nome ou ID)..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-zinc-800"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-2 max-h-48 overflow-y-auto pr-2">
        {filtered.map((eq) => (
          <button
            key={eq.id}
            onClick={() => {
              setSelected(eq);
              onSelect(eq);
              setQuery("");
            }}
            className={cn(
              "flex flex-col items-start p-3 rounded-lg border text-left transition-all hover:border-blue-500",
              selected?.id === eq.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-zinc-900 dark:border-zinc-800"
            )}
          >
            <span className="font-semibold text-sm">{eq.name}</span>
            <span className="text-xs text-zinc-500">{eq.id} • {eq.brand} {eq.model}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/40">
          <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">Observações do Equipamento:</p>
            <p className="text-sm text-orange-700 dark:text-orange-300">{selected.observations}</p>
          </div>
        </div>
      )}
    </div>
  );
}
