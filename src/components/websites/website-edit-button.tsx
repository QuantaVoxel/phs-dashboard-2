"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { WebsiteSheet } from "./website-sheet";

interface WebsiteEditButtonProps {
  website: any;
}

export function WebsiteEditButton({ website }: WebsiteEditButtonProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsSheetOpen(true)}
        className="font-mono text-[10px] text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-1 transition-colors border border-border px-3 py-1.5 bg-surface/20 hover:bg-surface/50"
      >
        <Edit2 className="h-3 w-3" /> Edit
      </button>
      
      <WebsiteSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={website} 
      />
    </>
  );
}
