"use client";

import { useState } from "react";
import EquipmentSelector from "@/components/requisicao/EquipmentSelector";
import ItemManager from "@/components/requisicao/ItemManager";
import { Save, Send, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateOrderNumber, getNextSequence } from "@/lib/utils/sequencer";
import Link from "next/link";
import { createOrder } from "./actions";

export default function RequisitionPage() {
  const [equipment, setEquipment] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [priority, setPriority] = useState("Normal");
  const [teamsLink, setTeamsLink] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalOrderNumber, setFinalOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateTempId = () => `DRAFT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const [tempId] = useState(generateTempId());

  const canSubmit = equipment && items.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        equipmentId: equipment.id,
        priority,
        items,
        teamsLink
      });
      
      setFinalOrderNumber(order.order_number || order.id.slice(0, 8));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erro ao submeter:", error);
      alert("Erro ao submeter o pedido. Verifique a consola ou as permissões RLS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pedido Submetido com Sucesso!</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            O seu pedido foi registado com o número: <span className="font-mono font-bold text-lg text-zinc-900 dark:text-white">{finalOrderNumber}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 px-6 py-2 border dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Voltar ao Dashboard
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Nova Requisição
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Nova Requisição</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            ID Provisório: <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">{tempId}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <Save className="h-4 w-4" />
            <span>Gravar Rascunho</span>
          </button>
          <button 
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all min-w-[160px] justify-center",
              canSubmit && !isSubmitting
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/20" 
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isSubmitting ? "A enviar..." : "Submeter Pedido"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="rounded-xl border bg-white dark:bg-zinc-900 p-6 dark:border-zinc-800 space-y-4">
            <h3 className="text-lg font-semibold">Equipamento</h3>
            <EquipmentSelector onSelect={(eq) => setEquipment(eq)} />
          </section>

          <section className="rounded-xl border bg-white dark:bg-zinc-900 p-6 dark:border-zinc-800 space-y-4">
            <h3 className="text-lg font-semibold">Prioridade & Extra</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Normal", "Urgente", "Emergência"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        "py-2 text-xs font-semibold rounded-md border transition-all",
                        priority === p 
                          ? p === "Emergência" 
                            ? "border-red-500 bg-red-500 text-white shadow-sm" 
                            : "border-blue-500 bg-blue-500 text-white shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teams / Folder Link (Smart Link)</label>
                <input
                  type="text"
                  placeholder="Cole o link da pasta do Teams aqui..."
                  className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-zinc-800 text-sm"
                  value={teamsLink}
                  onChange={(e) => setTeamsLink(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <section className="rounded-xl border bg-white dark:bg-zinc-900 p-6 dark:border-zinc-800 space-y-6 min-h-[500px]">
            <h3 className="text-lg font-semibold">Gestão de Artigos</h3>
            <ItemManager onUpdate={(newItems) => setItems(newItems)} />
          </section>
        </div>
      </div>
    </div>
  );
}
