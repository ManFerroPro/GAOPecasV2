"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/validacao/actions";
import MasterDetailRow from "@/components/shared/MasterDetailRow";
import { Loader2 } from "lucide-react";

export default function OrderValidationItem({ order, children }: { order: any, children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = async (action: string) => {
    if (action === "approve") {
      if (!confirm("Tem a certeza que deseja APROVAR este pedido?")) return;
      startTransition(async () => {
        try {
          await updateOrderStatus(order.id, "Validado");
        } catch (error) {
          alert("Erro ao validar: " + (error as any).message);
        }
      });
    } else if (action === "reject") {
      const reason = prompt("Indique o motivo da rejeição:");
      if (!reason) return;
      startTransition(async () => {
        try {
          await updateOrderStatus(order.id, "Rejeitado", reason);
        } catch (error) {
          alert("Erro ao rejeitar: " + (error as any).message);
        }
      });
    }
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/20 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}
      <MasterDetailRow order={order} onAction={handleAction}>
        {children}
      </MasterDetailRow>
    </div>
  );
}
