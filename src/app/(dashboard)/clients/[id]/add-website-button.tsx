"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WebsiteSheet } from "@/components/websites/website-sheet";

export function AddWebsiteButton({ clientId }: { clientId: string }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsSheetOpen(true)}
        className="font-mono text-[10px] text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-1 transition-colors"
      >
        <Plus className="h-3 w-3" /> Add Website
      </button>
      
      <WebsiteSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={{ clientId }} 
      />
    </>
  );
}
