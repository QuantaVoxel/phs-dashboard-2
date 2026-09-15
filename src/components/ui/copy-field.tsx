"use client";

import { useState } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";

export function CopyField({ label, value, hidden = false }: { label: string, value: string, hidden?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">{label}</span>
      <div className="flex items-center border border-border bg-surface/10 group">
        <code className="flex-1 px-3 py-2 font-mono text-xs text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
          {hidden && !show ? "••••••••••••••••••••••••••••••" : value}
        </code>
        {hidden && (
          <button 
            onClick={() => setShow(!show)}
            className="p-2.5 border-l border-border hover:bg-surface-hover transition-colors"
            title={show ? "Hide value" : "Reveal value"}
          >
            {show ? (
              <EyeOff className="h-3.5 w-3.5 text-text-muted hover:text-text-primary" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-text-muted hover:text-text-primary" />
            )}
          </button>
        )}
        <button 
          onClick={handleCopy} 
          className="p-2.5 border-l border-border hover:bg-surface-hover transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
}
