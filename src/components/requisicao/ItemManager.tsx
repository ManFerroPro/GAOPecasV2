import { useState } from "react";
import { Plus, Trash2, Search, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import CsvImport from "./CsvImport";

interface Item {
  omatapalo_code: string;
  part_number: string;
  description: string;
  qty: number;
  unit: string;
}

const MOCK_ITEMS: Item[] = [
  { omatapalo_code: "ART-101", part_number: "PN-XPTO-123", description: "Filtro de Óleo", qty: 100, unit: "UN" },
  { omatapalo_code: "ART-102", part_number: "PN-ABC-456", description: "Junta de Cabeça", qty: 50, unit: "UN" },
  { omatapalo_code: "ART-103", part_number: "PN-789-QWE", description: "Fluido Travões 5L", qty: 200, unit: "L" },
];

export default function ItemManager({ onUpdate }: { onUpdate: (items: (Item & { requestedQty: number })[]) => void }) {
  const [selectedItems, setSelectedItems] = useState<(Item & { requestedQty: number })[]>([]);
  const [query, setQuery] = useState("");
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  const addItem = (item: Item) => {
    if (selectedItems.find(i => i.omatapalo_code === item.omatapalo_code)) return;
    const newItems = [...selectedItems, { ...item, requestedQty: 1 }];
    setSelectedItems(newItems);
    onUpdate(newItems);
  };

  const addItemsFromCsv = (items: any[]) => {
    const newItems = [...selectedItems];
    items.forEach(item => {
      if (!newItems.find(i => i.omatapalo_code === item.omatapalo_code)) {
        newItems.push({ ...item, qty: 0 }); // qty 0 because it's mock
      }
    });
    setSelectedItems(newItems);
    onUpdate(newItems);
  };

  const removeItem = (code: string) => {
    const newItems = selectedItems.filter(i => i.omatapalo_code !== code);
    setSelectedItems(newItems);
    onUpdate(newItems);
  };

  const updateQty = (code: string, qty: number) => {
    const newItems = selectedItems.map(i => i.omatapalo_code === code ? { ...i, requestedQty: qty } : i);
    setSelectedItems(newItems);
    onUpdate(newItems);
  };

  const filteredItems = MOCK_ITEMS.filter(i => 
    i.description.toLowerCase().includes(query.toLowerCase()) || 
    i.omatapalo_code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar Artigos (Nome ou Código)..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-zinc-800"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsCsvOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <FileUp className="h-4 w-4" />
          <span>Importar CSV</span>
        </button>
      </div>

      {isCsvOpen && (
        <CsvImport 
          onImport={addItemsFromCsv} 
          onClose={() => setIsCsvOpen(false)} 
        />
      )}

      {query && (
        <div className="grid gap-2 border dark:border-zinc-800 rounded-lg p-2 max-h-48 overflow-y-auto">
          {filteredItems.map((item) => (
            <button
              key={item.omatapalo_code}
              onClick={() => addItem(item)}
              className="flex justify-between items-center p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors"
            >
              <div>
                <p className="font-semibold text-sm">{item.description}</p>
                <p className="text-xs text-zinc-500">{item.omatapalo_code} • {item.part_number}</p>
              </div>
              <Plus className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}

      <div className="border dark:border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Cód. Omatapalo</th>
              <th className="px-4 py-3 font-semibold">Descrição</th>
              <th className="px-4 py-3 font-semibold w-24 text-center">Qt. Pedida</th>
              <th className="px-4 py-3 font-semibold w-16 text-center">Unid.</th>
              <th className="px-4 py-3 font-semibold w-16 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {selectedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Nenhum artigo adicionado.
                </td>
              </tr>
            ) : (
              selectedItems.map((item) => (
                <tr key={item.omatapalo_code} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">{item.omatapalo_code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-zinc-500">{item.part_number}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      className="w-16 mx-auto text-center border dark:border-zinc-800 rounded px-1 py-1 bg-white dark:bg-zinc-900"
                      value={item.requestedQty}
                      onChange={(e) => updateQty(item.omatapalo_code, parseInt(e.target.value) || 1)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">{item.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => removeItem(item.omatapalo_code)} className="text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
