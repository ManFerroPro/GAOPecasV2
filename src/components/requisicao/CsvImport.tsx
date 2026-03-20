"use client";

import { useState } from "react";
import { X, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CsvImportProps {
  onImport: (items: any[]) => void;
  onClose: () => void;
}

export default function CsvImport({ onImport, onClose }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Por favor, selecione um ficheiro CSV válido.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      
      // Mock CSV Parsing
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Simple mock parse: Código, Quantidade
        const lines = text.split("\n").slice(1).filter(l => l.trim());
        const data = lines.map(line => {
          const [code, qty] = line.split(",");
          return {
            omatapalo_code: code.trim(),
            description: `Artigo Importado (${code.trim()})`,
            requestedQty: parseInt(qty.trim()) || 1,
            unit: "UN",
            part_number: "N/A"
          };
        });
        setPreview(data);
      };
      reader.readAsText(selectedFile);
    }
  };

  const confirmImport = () => {
    onImport(preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-2xl w-full max-w-2xl overflow-hidden scale-in-center">
        <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
          <h3 className="text-lg font-semibold">Importação em Massa (CSV)</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!file ? (
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-500 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
              />
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">Clique para carregar ou arraste o ficheiro</p>
                <p className="text-sm text-zinc-500">Formato esperado: Código, Quantidade</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Ficheiro carregado: {file.name}</span>
              </div>
              
              <div className="border dark:border-zinc-800 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Descrição</th>
                      <th className="px-3 py-2 w-16 text-center">Qt.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800">
                    {preview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-3 py-2 font-mono">{item.omatapalo_code}</td>
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-center">{item.requestedQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t dark:border-zinc-800">
          <button 
            onClick={() => { setFile(null); setPreview([]); }}
            className="px-4 py-2 text-sm font-medium hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Limpar
          </button>
          <button 
            disabled={!file || preview.length === 0}
            onClick={confirmImport}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirmar Importação
          </button>
        </div>
      </div>
    </div>
  );
}
