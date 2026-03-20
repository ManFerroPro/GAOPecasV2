"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SmartLinkButton({ url }: { url: string }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0078d4] text-white rounded-lg text-sm font-semibold hover:bg-[#005a9e] transition-all shadow-md shadow-blue-500/10"
    >
      <div className="bg-white/20 p-1 rounded">
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
      Pasta Teams / SharePoint
    </a>
  );
}
