"use client";

import { useState } from "react";
import { X, Loader2, Edit2, Trash2, Settings2 } from "lucide-react";
import { upsertEquipment, deleteEquipment } from "@/app/equipamentos/actions";
import BrandModelManagerModal from "./BrandModelManagerModal";
import EquipmentTypeManagerModal from "./EquipmentTypeManagerModal";

interface EquipmentFormProps {
  initialData?: any;
  initialBrands: any[];
  initialTypes: any[];
  onClose: (success?: boolean) => void;
}

export default function EquipmentFormModal({ initialData, initialBrands, initialTypes, onClose }: EquipmentFormProps) {
  const [isEditing, setIsEditing] = useState(!initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBrandManager, setShowBrandManager] = useState(false);
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [brands, setBrands] = useState<any[]>(initialBrands);
  const [types, setTypes] = useState<any[]>(initialTypes);

  const isAdmin = true;

  const [formData, setFormData] = useState({
    mobile_id: initialData?.mobile_id || "",
    license_plate: initialData?.license_plate || "",
    vin: initialData?.vin || "",
    year: initialData?.year || new Date().getFullYear(),
    engine_no: initialData?.engine_no || "",
    observations: initialData?.observations || "",
    brand_id: initialData?.brand_id || "",
    model_id: initialData?.model_id || "",
    type_id: initialData?.type_id || "",
    category_id: initialData?.category_id || "",
    subcategory_id: initialData?.subcategory_id || "",
  });

  const selectedBrand = brands.find(b => b.id === formData.brand_id);
  const availableModels = selectedBrand?.equipment_models || [];
  const selectedType = types.find(t => t.id === formData.type_id);
  const availableCategories = selectedType?.equipment_categories || [];
  const selectedCategory = availableCategories.find((c: any) => c.id === formData.category_id);
  const availableSubcategories = selectedCategory?.equipment_subcategories || [];

  const handleDeleteAction = async () => {
    if (!formData.mobile_id) return;
    if (!confirm("Tem a certeza que deseja eliminar este equipamento?")) return;
    try {
      await deleteEquipment(formData.mobile_id);
      onClose(true);
    } catch {
      alert("Erro ao eliminar o equipamento.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile_id) return;
    setIsSubmitting(true);
    try {
      await upsertEquipment(formData);
      alert("Equipamento guardado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      alert("Erro ao guardar: " + (error as any).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase disabled:opacity-50";
  const selectCls = "w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-600 transition-all text-[11px] font-bold uppercase disabled:opacity-50 cursor-pointer";
  const labelCls = "text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1";

  const handleBrandManagerClose = (updatedBrands?: any[]) => {
    if (updatedBrands) setBrands(updatedBrands);
    setShowBrandManager(false);
  };

  const handleTypeManagerClose = (updatedTypes?: any[]) => {
    if (updatedTypes) setTypes(updatedTypes);
    setShowTypeManager(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-3xl flex flex-col overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">

          {/* Header */}
          <div className="px-8 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-6">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
                {initialData
                  ? <>EQUIPAMENTO: <span className="text-blue-600">{initialData.mobile_id}</span></>
                  : "NOVO EQUIPAMENTO"}
              </h3>
              {!isEditing && isAdmin && initialData && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <Edit2 className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button type="button" onClick={handleDeleteAction} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-[10px] font-black uppercase tracking-widest">
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </button>
                </div>
              )}
            </div>
            <button type="button" onClick={() => onClose()} className="p-3 bg-white dark:bg-zinc-800 rounded-full hover:scale-110 transition-all border border-zinc-100 dark:border-zinc-700">
              <X className="h-5 w-5 text-zinc-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">

            {/* Row 1: ID + Matrícula */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Nº Máquina (ID)*</label>
                <input required disabled={!isEditing || !!initialData} placeholder="Ex: EQ-999"
                  className={inputCls + " font-black italic tracking-tighter text-blue-600 text-[12px]"}
                  value={formData.mobile_id}
                  onChange={e => setFormData({ ...formData, mobile_id: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Matrícula</label>
                <input disabled={!isEditing} className={inputCls}
                  value={formData.license_plate}
                  onChange={e => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })} />
              </div>
            </div>

            {/* Row 2: Marca + Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className={labelCls}>Marca</label>
                  {isEditing && (
                    <button type="button" onClick={() => setShowBrandManager(true)} className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-600 hover:text-blue-800 tracking-widest">
                      <Settings2 className="h-3 w-3" /> Gerir Marcas
                    </button>
                  )}
                </div>
                <select disabled={!isEditing} className={selectCls}
                  value={formData.brand_id}
                  onChange={e => setFormData({ ...formData, brand_id: e.target.value, model_id: "" })}>
                  <option value="">— SELECIONAR —</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Modelo</label>
                <select disabled={!isEditing || !formData.brand_id} className={selectCls}
                  value={formData.model_id}
                  onChange={e => setFormData({ ...formData, model_id: e.target.value })}>
                  <option value="">— SELECIONAR —</option>
                  {availableModels.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3: Tipo / Categoria / Subcategoria */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className={labelCls}>Tipo</label>
                  {isEditing && (
                    <button type="button" onClick={() => setShowTypeManager(true)} className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-600 hover:text-blue-800 tracking-widest">
                      <Settings2 className="h-3 w-3" /> Gerir
                    </button>
                  )}
                </div>
                <select disabled={!isEditing} className={selectCls}
                  value={formData.type_id}
                  onChange={e => setFormData({ ...formData, type_id: e.target.value, category_id: "", subcategory_id: "" })}>
                  <option value="">— SELECIONAR —</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Categoria</label>
                <select disabled={!isEditing || !formData.type_id} className={selectCls}
                  value={formData.category_id}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value, subcategory_id: "" })}>
                  <option value="">— SELECIONAR —</option>
                  {availableCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Subcategoria</label>
                <select disabled={!isEditing || !formData.category_id} className={selectCls}
                  value={formData.subcategory_id}
                  onChange={e => setFormData({ ...formData, subcategory_id: e.target.value })}>
                  <option value="">— SELECIONAR —</option>
                  {availableSubcategories.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4: Ano + VIN + Motor */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Ano</label>
                <input type="number" disabled={!isEditing} className={inputCls}
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Chassis (VIN)</label>
                <input disabled={!isEditing} className={inputCls + " font-mono"}
                  value={formData.vin}
                  onChange={e => setFormData({ ...formData, vin: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Nº Motor</label>
                <input disabled={!isEditing} className={inputCls + " font-mono"}
                  value={formData.engine_no}
                  onChange={e => setFormData({ ...formData, engine_no: e.target.value.toUpperCase() })} />
              </div>
            </div>

            {/* Row 5: Observações */}
            <div className="space-y-1.5">
              <label className={labelCls}>Observações</label>
              <textarea disabled={!isEditing} rows={3} className={inputCls + " resize-none leading-normal"}
                value={formData.observations}
                onChange={e => setFormData({ ...formData, observations: e.target.value.toUpperCase() })}
                placeholder="ESCREVA AQUI INFORMAÇÕES ADICIONAIS..." />
            </div>

          </form>

          {/* Footer */}
          <div className="px-8 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic">* CAMPOS OBRIGATÓRIOS</span>
            <div className="flex items-center gap-8">
              <button type="button" onClick={() => onClose()} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900">
                {isEditing ? "CANCELAR" : "FECHAR"}
              </button>
              {isEditing && (
                <button type="button" onClick={handleSubmit as any} disabled={isSubmitting}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.1em] shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-30">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "GUARDAR ALTERAÇÕES"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBrandManager && (
        <BrandModelManagerModal initialBrands={brands} onClose={handleBrandManagerClose} />
      )}
      {showTypeManager && (
        <EquipmentTypeManagerModal initialTypes={types} onClose={handleTypeManagerClose} />
      )}
    </>
  );
}
