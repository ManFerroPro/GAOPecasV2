"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string }) => void;
  title: string;
  type: "approve" | "reject" | "info";
  orderNumber: string;
}

export default function ActionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  type,
  orderNumber
}: ActionModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden scale-in-center">
        <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            {type === "approve" && <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />}
            {type === "reject" && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
            {type === "info" && <Info className="h-5 w-5 text-blue-600 mt-0.5" />}
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Pedido: <span className="font-mono">{orderNumber}</span></p>
              <p className="text-sm text-zinc-500">
                {type === "reject" ? "Indique o motivo da rejeição deste pedido." : "Deseja adicionar algum comentário à sua decisão?"}
              </p>
            </div>
          </div>

          <textarea
            placeholder="Escreva aqui..."
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-zinc-800 text-sm h-24 resize-none"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t dark:border-zinc-800">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:text-zinc-900 dark:hover:white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => { onConfirm({ reason }); onClose(); }}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-md",
              type === "reject" ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            )}
          >
            Confirmar Decisão
          </button>
        </div>
      </div>
    </div>
  );
}
