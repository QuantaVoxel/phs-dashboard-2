"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Command } from "lucide-react";
import { ClientSheet } from "@/components/clients/client-sheet";
import { WebsiteSheet } from "@/components/websites/website-sheet";
import Link from "next/link";

export function Topbar() {
  const pathname = usePathname();
  const [isClientSheetOpen, setIsClientSheetOpen] = useState(false);
  const [isWebsiteSheetOpen, setIsWebsiteSheetOpen] = useState(false);
  
  // Terminal style path
  const terminalPath = pathname === '/' ? '~/overview' : `~${pathname}`;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between px-6 md:px-10 border-b border-border bg-[#000000] text-text-primary">
        
        {/* Left: Breadcrumbs / Path */}
        <div className="flex items-center text-sm font-mono tracking-widest uppercase">
          <span className="text-brand mr-2">SYS</span> 
          <span className="text-text-muted">{terminalPath}</span>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          
          <button className="hidden sm:flex items-center gap-2 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border">
            <span>Query</span>
            <div className="flex items-center gap-0.5">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </button>

          <div className="flex items-center border-l border-border pl-4 gap-2">
            <button 
              onClick={() => setIsClientSheetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              <Plus className="h-3 w-3" /> Entity
            </button>
            <button 
              onClick={() => setIsWebsiteSheetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-brand/50 text-brand hover:bg-brand/10 transition-colors"
            >
              <Plus className="h-3 w-3" /> Property
            </button>
          </div>

        </div>
      </header>

      <ClientSheet open={isClientSheetOpen} onOpenChange={setIsClientSheetOpen} />
      <WebsiteSheet open={isWebsiteSheetOpen} onOpenChange={setIsWebsiteSheetOpen} />
    </>
  );
}
