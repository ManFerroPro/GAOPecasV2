"use client";

import { useState } from "react";
import { Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  isMe: boolean;
}

export default function OrderChat({ orderId }: { orderId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", user: "João Silva", text: "Olá, este item é realmente urgente?", time: "10:30", isMe: false },
    { id: "2", user: "Sistema", text: "Prioridade alterada para Emergência por Manuel Ferreira", time: "10:32", isMe: true },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Math.random().toString(),
      user: "Manuel Ferreira",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[300px] border dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex flex-col", msg.isMe ? "items-end" : "items-start")}>
            <div className="flex items-center gap-2 mb-1">
              {!msg.isMe && <User className="h-3 w-3 text-zinc-400" />}
              <span className="text-[10px] font-bold text-zinc-500 uppercase">{msg.user}</span>
              <span className="text-[10px] text-zinc-400">{msg.time}</span>
            </div>
            <div className={cn(
              "px-3 py-2 rounded-2xl text-xs max-w-[80%]",
              msg.isMe 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t dark:border-zinc-800 flex gap-2">
        <input 
          type="text" 
          placeholder="Escreva uma mensagem..."
          className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
