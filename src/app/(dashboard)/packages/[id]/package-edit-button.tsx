"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { PackageSheet } from "@/components/packages/package-sheet";

interface PackageEditButtonProps {
  pkg: any; // We can type this loosely since Prisma handles the strict types elsewhere
}

export function PackageEditButton({ pkg }: PackageEditButtonProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsSheetOpen(true)}
        className="font-mono text-[10px] text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-1 transition-colors border border-border px-3 py-1.5 bg-surface/20 hover:bg-surface/50"
      >
        <Edit2 className="h-3 w-3" /> Edit
      </button>
      
      <PackageSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        initialData={pkg} 
      />
    </>
  );
}
