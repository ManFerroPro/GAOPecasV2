"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { Search, Plus, X, Loader2, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import EquipmentFormModal from "./EquipmentFormModal";
import { cn } from "@/lib/utils";

interface EquipmentListClientProps {
  initialItems: any[];
  initialBrands: any[];
  initialTypes: any[];
}

export default function EquipmentListClient({ initialItems, initialBrands, initialTypes }: EquipmentListClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const router = useRouter();

  const [searchId, setSearchId] = useState("");
  const [searchPlate, setSearchPlate] = useState("");
  const [searchBrand, setSearchBrand] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [searchVin, setSearchVin] = useState("");
  const [searchYear, setSearchYear] = useState("");

  const clearAll = () => {
    setSearchId(""); setSearchPlate(""); setSearchBrand("");
    setSearchModel(""); setSearchVin(""); setSearchYear("");
  };

  const filteredItems = initialItems.filter(eq => {
    const matchId = eq.mobile_id?.toLowerCase().includes(searchId.toLowerCase());
    const matchPlate = eq.license_plate?.toLowerCase().includes(searchPlate.toLowerCase()) || searchPlate === "";
    const matchBrand = eq.brand_name?.toLowerCase().includes(searchBrand.toLowerCase()) || searchBrand === "";
    const matchModel = eq.model_name?.toLowerCase().includes(searchModel.toLowerCase()) || searchModel === "";
    const matchVin = eq.vin?.toLowerCase().includes(searchVin.toLowerCase()) || searchVin === "";
    const matchYear = eq.year?.toString().includes(searchYear) || searchYear === "";
    return matchId && matchPlate && matchBrand && matchModel && matchVin && matchYear;
  }).sort((a, b) => a.mobile_id?.localeCompare(b.mobile_id, undefined, { numeric: true, sensitivity: "base" }));

  const searchInputCls = "w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all text-[11px] font-bold uppercase shadow-sm";

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-8 bg-white dark:bg-zinc-950 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col pt-3 pb-6 overflow-hidden">

        <header className="px-6 mb-4 flex-shrink-0">
          <h1 className="text-[2.5rem] font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100 leading-none">Equipamentos</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-0.5">Gestão de Frota e Máquinas Pesadas</p>
        </header>

        {/* Search Row */}
        <div className="px-6 flex items-end gap-2 mb-4 flex-shrink-0">
          {[
            { label: "Equipamento", value: searchId, set: setSearchId, placeholder: "EQ..." },
            { label: "Matrícula", value: searchPlate, set: setSearchPlate, placeholder: "00-AA-00" },
            { label: "Marca", value: searchBrand, set: setSearchBrand, placeholder: "Marca" },
            { label: "Modelo", value: searchModel, set: setSearchModel, placeholder: "Modelo" },
            { label: "VIN", value: searchVin, set: setSearchVin, placeholder: "VIN..." },
            { label: "Ano", value: searchYear, set: setSearchYear, placeholder: "Ano" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} className="flex-1 space-y-1">
              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest pl-1">{label}</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
                <input type="text" placeholder={placeholder} className={searchInputCls}
                  value={value}
                  onChange={e => set(e.target.value)} />
              </div>
            </div>
          ))}
          <div className="flex gap-2 pb-0.5">
            <button onClick={clearAll} className="p-2.5 bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20" title="Limpar filtros">
              <X className="h-4 w-4 text-white stroke-[4]" />
            </button>
            <button
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Equipamento
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/40 bg-white dark:bg-zinc-900">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 z-10 shadow-[0_2px_0_0_rgba(228,228,231,1)] dark:shadow-[0_2px_0_0_rgba(39,39,42,1)]">
                <tr className="text-[9px] uppercase font-black text-zinc-600 dark:text-zinc-400 tracking-[0.2em]">
                  <th className="px-8 py-4 w-[170px]">Equipamento</th>
                  <th className="px-8 py-4 w-[160px]">Marca / Modelo</th>
                  <th className="px-8 py-4 w-[240px]">Tipo / Categoria</th>
                  <th className="px-8 py-4">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-zinc-100 dark:border-zinc-800">
                {filteredItems.map((eq) => (
                  <EquipmentRow
                    key={eq.mobile_id}
                    eq={eq}
                    onDoubleClick={() => { setEditingItem(eq); setIsModalOpen(true); }}
                  />
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">
                      Nenhum equipamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EquipmentFormModal
          initialData={editingItem}
          initialBrands={initialBrands}
          initialTypes={initialTypes}
          onClose={(s) => { setIsModalOpen(false); setEditingItem(null); if (s) router.refresh(); }}
        />
      )}
    </div>
  );
}

function EquipmentRow({ eq, onDoubleClick }: { eq: any; onDoubleClick: () => void }) {
  const obsRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    if (obsRef.current) {
      setIsTruncated(obsRef.current.scrollWidth > obsRef.current.clientWidth);
    }
  }, [eq.observations]);

  return (
    <tr
      className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group cursor-pointer"
      onDoubleClick={onDoubleClick}
    >
      <td className="px-8 py-5 align-top">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="font-mono font-black text-blue-600 dark:text-blue-500 text-[14px] tracking-[0.15em]">{eq.mobile_id}</span>
          </div>
          {eq.license_plate && (
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{eq.license_plate}</span>
          )}
        </div>
      </td>
      <td className="px-8 py-5 align-top">
        <div className="space-y-0.5">
          <span className="text-zinc-400 font-black uppercase text-[8px] tracking-widest">{eq.brand_name || "—"}</span>
          <p className="text-[13px] font-black uppercase text-zinc-900 dark:text-zinc-100 leading-tight">{eq.model_name || "—"}</p>
        </div>
      </td>
      <td className="px-8 py-5 align-top">
        <div className="space-y-0.5">
          <span className="text-zinc-400 font-black uppercase text-[8px] tracking-widest">{eq.type_name || "—"}</span>
          <p className="text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300">{eq.category_name || "—"}</p>
          {eq.subcategory_name && (
            <p className="text-[10px] font-bold uppercase text-zinc-400">{eq.subcategory_name}</p>
          )}
        </div>
      </td>
      <td className="px-8 py-5 align-top">
        <div className="space-y-1">
          <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold">
            {eq.year && <span className="uppercase tracking-widest">Ano: <span className="text-zinc-700 dark:text-zinc-300">{eq.year}</span></span>}
            {eq.vin && <span className="uppercase tracking-widest">VIN: <span className="font-mono text-zinc-600 dark:text-zinc-400">{eq.vin}</span></span>}
            {eq.engine_no && <span className="uppercase tracking-widest">Motor: <span className="font-mono text-zinc-600 dark:text-zinc-400">{eq.engine_no}</span></span>}
          </div>
          {eq.observations && (
            <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 overflow-hidden">
              <span className="text-orange-600 font-black italic whitespace-nowrap">OBS:</span>
              <span ref={obsRef} className="truncate flex-1 font-medium italic">{eq.observations}</span>
              {isTruncated && (
                <button onClick={(e) => { e.stopPropagation(); onDoubleClick(); }} className="text-[9px] font-black text-blue-600 hover:underline whitespace-nowrap ml-1">
                  ... VER MAIS
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
