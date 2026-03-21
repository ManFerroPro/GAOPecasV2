"use client";

import { useState } from "react";
import { X, Upload, FileDown, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { upsertArticle } from "@/app/artigos/actions";
import { createClient } from "@/utils/supabase/client";

interface BulkImportProps {
  onClose: (success?: boolean) => void;
}

export default function BulkImportModal({ onClose }: BulkImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ created: number, ignored: number, logs: string[] } | null>(null);
  const supabase = createClient();

  const handleDownloadTemplate = () => {
    const headers = "omatapalo_code,description,family_name,sub_family_name,unit\n";
    const example = "MP-001,FILTRO OLEO VOLVO,FILTROS,FILTRO OLEO,UN\n";
    const blob = new Blob([headers + example], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "template_artigos.csv";
    a.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const content = await file.text();
    const rows = content.split('\n').filter(row => row.trim());
    const dataRows = rows.slice(1); // Remove header
    
    setProgress({ current: 0, total: dataRows.length });
    
    let created = 0;
    let ignored = 0;
    const logs: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      // Use a more robust split for CSV if necessary (simple comma split for now)
      const [code, desc, fam, sub, unit] = row.split(',').map(s => s?.trim());
      
      if (!code || !desc) {
          ignored++;
          logs.push(`Linha ${i + 2}: Dados insuficientes.`);
          continue;
      }

      // Check for existence (Ignore duplicates rule)
      const { data: existing } = await supabase
        .from('items')
        .select('omatapalo_code')
        .eq('omatapalo_code', code.toUpperCase())
        .maybeSingle();

      if (existing) {
        ignored++;
        logs.push(`${code.toUpperCase()}: Artigo já existe (Ignorado).`);
        setProgress(prev => ({ ...prev, current: i + 1 }));
        continue;
      }

      try {
        await upsertArticle({
          omatapalo_code: code.toUpperCase(),
          description: desc.toUpperCase(),
          family: fam?.toUpperCase(), // Trigger will handle mapping if we add logic or keep it text
          sub_family: sub?.toUpperCase(),
          unit: unit?.toUpperCase() || "UN"
        }, []);
        created++;
      } catch (error) {
        ignored++;
        logs.push(`${code}: Erro inesperado.`);
      }
      
      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setResults({ created, ignored, logs });
    setIsImporting(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 text-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl shadow-2xl border dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="text-xl font-bold">Importar Artigos em Massa</h3>
          <button onClick={() => onClose()} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!results ? (
            <>
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 text-center gap-4">
                <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                   <p className="font-bold">Selecione o ficheiro CSV</p>
                   <p className="text-xs text-zinc-500 font-medium">Os artigos existentes serão ignorados automaticamente.</p>
                </div>
                <input 
                  type="file" 
                  accept=".csv"
                  className="hidden" 
                  id="csv-upload" 
                  onChange={handleFileUpload}
                  disabled={isImporting}
                />
                <label 
                  htmlFor="csv-upload"
                  className={cn(
                    "px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer transition-all shadow-lg shadow-blue-500/10",
                    isImporting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Procurar Ficheiro
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <FileDown className="h-5 w-5 text-zinc-400" />
                  <span className="font-medium">Template de Importação</span>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Download .CSV
                </button>
              </div>

              {isImporting && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                    <span>A processar...</span>
                    <span>{progress.current} / {progress.total}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border dark:border-zinc-800">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Importação Concluída</h4>
                  <p className="text-zinc-500">O processamento terminou com sucesso.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border dark:border-zinc-800 text-center shadow-sm">
                  <span className="block text-2xl font-black text-green-600">{results.created}</span>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Criados</span>
                </div>
                <div className="p-4 rounded-xl border dark:border-zinc-800 text-center shadow-sm">
                  <span className="block text-2xl font-black text-amber-500">{results.ignored}</span>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Ignorados</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] font-black uppercase text-zinc-500 flex items-center justify-between">
                  <span>Log de Ocorrências</span>
                  <span className="opacity-50">Clique OK para fechar</span>
                </h5>
                <div className="max-h-[150px] overflow-auto p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 space-y-1.5 shadow-inner">
                  {results.logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="opacity-30">[{i+1}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {results.logs.length === 0 && <p className="italic opacity-30">Sem ocorrências a registar.</p>}
                </div>
              </div>

              <button 
                onClick={() => onClose(true)}
                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-zinc-200 dark:shadow-none"
              >
                Concluído
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
