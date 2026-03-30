"use client";

import { useState } from "react";
import { X, Upload, FileDown, CheckCircle, AlertTriangle, Loader2, FileType } from "lucide-react";
import * as XLSX from "xlsx";
import { upsertEquipment } from "@/app/equipamentos/actions";
import { createClient } from "@/utils/supabase/client";

interface BulkImportProps {
  initialBrands: any[];
  initialTypes: any[];
  onClose: (success?: boolean) => void;
}

export default function EquipmentBulkImportModal({ initialBrands, initialTypes, onClose }: BulkImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ created: number, ignored: number, logs: string[] } | null>(null);
  const supabase = createClient();

  const handleDownloadTemplate = () => {
    const data = [
      ["Equipamento", "Matrícula", "Marca", "Modelo", "Tipo", "Categoria", "Subcategoria", "Ano", "VIN", "Motor", "Observações"],
      ["EQ-001", "00-AA-00", "TOYOTA", "HILUX", "LIGEIRO", "PICK-UP", "PICK-UP 4X4", "2023", "VIN123456789", "ENG987654", "EQUIPAMENTO DE TESTE"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipamentos");
    XLSX.writeFile(wb, "Importar Equipamentos.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
    
    setProgress({ current: 0, total: jsonData.length });
    
    let created = 0;
    let ignored = 0;
    const logs: string[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const mobileId = row.Equipamento?.toString().trim();
      
      if (!mobileId) {
          ignored++;
          logs.push(`Linha ${i + 2}: Nº Máquina (ID) em falta.`);
          continue;
      }

      // Check for existence
      const { data: existing } = await supabase
        .from('equipment')
        .select('mobile_id')
        .eq('mobile_id', mobileId.toUpperCase())
        .maybeSingle();

      if (existing) {
        ignored++;
        logs.push(`${mobileId.toUpperCase()}: Equipamento já existe (Ignorado).`);
        setProgress(prev => ({ ...prev, current: i + 1 }));
        continue;
      }

      // Resolve IDs
      const brand = initialBrands.find(b => b.name?.toUpperCase() === row.Marca?.toString().trim().toUpperCase());
      const model = brand?.equipment_models?.find((m: any) => m.name?.toUpperCase() === row.Modelo?.toString().trim().toUpperCase());
      const type = initialTypes.find(t => t.name?.toUpperCase() === row.Tipo?.toString().trim().toUpperCase());
      const category = type?.equipment_categories?.find((c: any) => c.name?.toUpperCase() === row.Categoria?.toString().trim().toUpperCase());
      const subcategory = category?.equipment_subcategories?.find((s: any) => s.name?.toUpperCase() === row.Subcategoria?.toString().trim().toUpperCase());

      try {
        await upsertEquipment({
          mobile_id: mobileId.toUpperCase(),
          license_plate: row.Matrícula?.toString().trim().toUpperCase() || null,
          brand_id: brand?.id || null,
          model_id: model?.id || null,
          type_id: type?.id || null,
          category_id: category?.id || null,
          subcategory_id: subcategory?.id || null,
          year: parseInt(row.Ano) || null,
          vin: row.VIN?.toString().trim().toUpperCase() || null,
          engine_no: row.Motor?.toString().trim().toUpperCase() || null,
          observations: row.Observações?.toString().trim().toUpperCase() || null
        });
        created++;
      } catch (error) {
        ignored++;
        logs.push(`${mobileId}: Erro ao inserir (${(error as any).message}).`);
      }
      
      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setResults({ created, ignored, logs });
    setIsImporting(false);
  };

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 text-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-xl shadow-2xl border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="text-xl font-black uppercase tracking-tighter">Importar Equipamentos em Massa</h3>
          <button onClick={() => onClose()} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!results ? (
            <>
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 text-center gap-4">
                <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <FileType className="h-8 w-8" />
                </div>
                <div>
                   <p className="font-black uppercase tracking-tighter text-lg">Selecione o ficheiro Excel</p>
                   <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Suporta .xlsx e .xls. IDs existentes serão ignorados.</p>
                </div>
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  className="hidden" 
                  id="csv-upload" 
                  onChange={handleFileUpload}
                  disabled={isImporting}
                />
                <label 
                  htmlFor="csv-upload"
                  className={cn(
                    "px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 cursor-pointer transition-all shadow-lg shadow-blue-500/20",
                    isImporting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Procurar Ficheiro
                </label>
              </div>

              <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <FileDown className="h-6 w-6 text-zinc-400" />
                  <div className="flex flex-col">
                    <span className="font-black uppercase text-[10px] tracking-widest">Template de Importação</span>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-0.5">Descarregue o modelo oficial</span>
                  </div>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-white dark:bg-zinc-900 text-blue-600 rounded-lg border border-blue-600/20 font-black uppercase text-[9px] tracking-widest hover:bg-blue-50 transition-all shadow-sm"
                >
                  Download .XLSX
                </button>
              </div>

              {isImporting && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-1">
                    <span>A processar equipamentos...</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950/40 border-2 border-zinc-100 dark:border-zinc-800">
                <div className="p-5 rounded-2xl bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tighter">Importação Concluída</h4>
                  <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-widest mt-0.5">O processamento terminou com sucesso.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 text-center shadow-sm">
                  <span className="block text-3xl font-black text-green-600 tracking-tighter">{results.created}</span>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Criados</span>
                </div>
                <div className="p-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 text-center shadow-sm">
                  <span className="block text-3xl font-black text-amber-500 tracking-tighter">{results.ignored}</span>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ignorados</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase text-zinc-500 flex items-center justify-between px-1 tracking-widest">
                  <span>Log de Ocorrências</span>
                  <span className="opacity-50">Registo de importação</span>
                </h5>
                <div className="max-h-[150px] overflow-auto p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 space-y-2 shadow-inner">
                  {results.logs.map((log, i) => (
                    <div key={i} className="flex gap-3 leading-relaxed">
                      <span className="opacity-20 font-black italic">[{String(i + 1).padStart(2, '0')}]</span>
                      <span className="font-medium">{log}</span>
                    </div>
                  ))}
                  {results.logs.length === 0 && <p className="italic opacity-30 font-bold uppercase tracking-widest text-[9px] py-4 text-center">Sem ocorrências a registar.</p>}
                </div>
              </div>

              <button 
                onClick={() => onClose(true)}
                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[12px] tracking-widest hover:opacity-90 transition-all shadow-xl shadow-zinc-200 dark:shadow-none translate-y-0 active:translate-y-1"
              >
                Concluir e Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
