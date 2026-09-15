"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { WebsiteSheet } from "@/components/websites/website-sheet";
import { CheckAllButton } from "@/components/websites/check-all-button";

export function WebsitePageClient() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
        <div className="relative flex-1 sm:w-64 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            placeholder="Query properties..." 
            className="w-full bg-transparent border border-border py-2 pl-9 pr-4 text-sm font-mono focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/50 rounded-none"
          />
        </div>
        <CheckAllButton />
        <button 
          onClick={() => setIsSheetOpen(true)} 
          className="flex items-center gap-2 bg-text-primary text-base px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors"
        >
          <Plus className="h-4 w-4" /> Register
        </button>
      </div>
      <WebsiteSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
