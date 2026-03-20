"use client";

import { useState } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";

export default function FileUploader({ orderId }: { orderId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<{name: string, size: string}[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setIsUploading(true);
    // Mock upload delay
    setTimeout(() => {
      const newFiles = Array.from(selectedFiles).map(f => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB"
      }));
      setFiles([...files, ...newFiles]);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-2 hover:border-blue-500 transition-colors cursor-pointer">
        <input 
          type="file" 
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleUpload}
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        ) : (
          <Upload className="h-8 w-8 text-zinc-400" />
        )}
        <div>
          <p className="text-sm font-semibold">Anexar Documentos/Fotos</p>
          <p className="text-xs text-zinc-500">PDF, JPG, PNG até 10MB</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <FileIcon className="h-4 w-4 text-blue-500" />
                <div className="text-left">
                  <p className="text-xs font-medium truncate max-w-[150px]">{file.name}</p>
                  <p className="text-[10px] text-zinc-500">{file.size}</p>
                </div>
              </div>
              <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-zinc-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
