"use client";

import { useState } from "react";
import { CopyField } from "@/components/ui/copy-field";
import { Key } from "lucide-react";

export function CredentialsModalButton({ client }: { client: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setOpen(true)} 
        className="font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors flex items-center gap-1"
      >
        <Key className="h-3 w-3" /> Config
      </button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/90 backdrop-blur-sm p-4">
          <div className="bg-[#020202] border border-border w-full max-w-md flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-border flex items-center justify-between">
               <span className="font-mono text-xs uppercase tracking-widest text-text-primary">
                 Routing Credentials <span className="text-text-muted">/ {client.name}</span>
               </span>
               <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary font-mono text-xs">
                 [ CLOSE ]
               </button>
             </div>
             <div className="p-6 flex flex-col gap-6">
               <CopyField 
                 label="Telegram Chat ID" 
                 value={client.telegramChatId || "Not configured"} 
               />
               <CopyField 
                 label="Bot Token" 
                 value={client.telegramBotToken || "System Default"} 
                 hidden={!!client.telegramBotToken} 
               />
             </div>
          </div>
        </div>
      )}
    </>
  );
}
