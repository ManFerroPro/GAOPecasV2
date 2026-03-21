"use client";

import { useState } from "react";
import { Search, Filter, Plus, Truck, Edit2, Trash2, Loader2 } from "lucide-react";
import EquipmentFormModal from "./EquipmentFormModal";
import { deleteEquipment } from "@/app/equipamentos/actions";

interface EquipmentListClientProps {
  initialItems: any[];
}

export default function EquipmentListClient({ initialItems }: EquipmentListClientProps) {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredItems = items.filter(item => 
    item.mobile_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este equipamento?")) return;
    setIsDeleting(id);
    try {
      await deleteEquipment(id);
      setItems(items.filter(i => i.mobile_id !== id));
    } catch (error) {
      alert("Erro ao eliminar: " + (error as any).message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleModalClose = (success?: boolean) => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (success) {
      window.location.reload(); 
    }
  };

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Gestão de frota e máquinas pesadas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" />
          Novo Equipamento
        </button>
      </header>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por ID, Marca ou Modelo..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border dark:border-zinc-800 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((eq) => (
          <div key={eq.mobile_id} className="group p-6 rounded-xl border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Truck className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setEditingItem(eq); setIsModalOpen(true); }}
                  className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(eq.mobile_id)}
                  className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  {isDeleting === eq.mobile_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 ml-2">
                  {eq.mobile_id}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-bold">{eq.brand} {eq.model}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{eq.license_plate || "Sem Matrícula"}</p>
            <div className="pt-4 border-t dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500 uppercase font-bold tracking-tight">
              <span>{eq.year || "Ano N/A"}</span>
              <span className="text-blue-600 hover:underline cursor-pointer">Ver Detalhes →</span>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-400 italic">
            Nenhum equipamento encontrado.
          </div>
        )}
      </div>

      {isModalOpen && (
        <EquipmentFormModal 
          initialData={editingItem}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
