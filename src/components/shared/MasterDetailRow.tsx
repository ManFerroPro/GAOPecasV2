"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Paperclip, 
  MessageSquare, 
  History as LucideHistory, 
  ListIcon,
  Check,
  X,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import OrderChat from "./OrderChat";
import FileUploader from "./FileUploader";

interface Order {
  id: string;
  orderNumber: string;
  equipment: string;
  requester: string;
  priority: "Normal" | "Urgente" | "Emergência";
  date: string;
  status: string;
  teamsLink?: string;
}

export default function MasterDetailRow({ 
  order, 
  onAction,
  children 
}: { 
  order: Order; 
  onAction?: (action: string) => void;
  children?: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"lines" | "attachments" | "chat" | "history">("lines");

  const isEmergency = order.priority === "Emergência";

  return (
    <div className={cn(
      "border-b dark:border-zinc-800 transition-all",
      isExpanded ? "bg-zinc-50/50 dark:bg-zinc-800/20" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
      isEmergency && !isExpanded && "border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-900/10"
    )}>
      <div className="flex items-center p-3 gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <button className="text-zinc-400">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        
        <div className="flex-1 grid grid-cols-6 gap-4 items-center">
          <span className="font-mono text-xs font-bold">{order.orderNumber}</span>
          <span className="text-sm font-medium truncate">{order.equipment}</span>
          <span className="text-sm text-zinc-500 truncate">{order.requester}</span>
          <div className="flex items-center">
            <span className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
              order.priority === "Normal" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800",
              order.priority === "Urgente" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
              order.priority === "Emergência" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {order.priority}
            </span>
          </div>
          <span className="text-xs text-zinc-500">{order.date}</span>
          <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onAction?.("approve")}
              className="p-1.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              title="Aprovar"
            >
              <Check className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onAction?.("reject")}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
              title="Rejeitar"
            >
              <X className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onAction?.("reschedule")}
              className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              title="Reagendar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
          <div className="flex border-b dark:border-zinc-800 mb-4">
            {[
              { id: "lines", label: "Artigos", icon: ListIcon },
              { id: "attachments", label: "Anexos", icon: Paperclip },
              { id: "chat", label: "Chat Interno", icon: MessageSquare },
              { id: "history", label: "Histórico", icon: LucideHistory },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                  activeTab === tab.id 
                    ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
            
            {order.teamsLink && (
              <a 
                href={order.teamsLink} 
                target="_blank" 
                rel="noreferrer"
                className="ml-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-t-md transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Teams Folder
              </a>
            )}
          </div>

          <div className="min-h-[200px]">
            {activeTab === "lines" && children}
            {activeTab === "attachments" && (
              <div className="py-4">
                <FileUploader orderId={order.id} />
              </div>
            )}
            {activeTab === "chat" && (
              <div className="py-4">
                <OrderChat orderId={order.id} />
              </div>
            )}
            {activeTab === "history" && (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-400 space-y-2">
                <LucideHistory className="h-8 w-8 opacity-20" />
                <p className="text-sm">Sem histórico de validação.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
