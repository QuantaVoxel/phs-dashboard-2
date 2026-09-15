"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PackageSheet } from "@/components/packages/package-sheet";

export function PackagePageClient({ packages }: { packages: any[] }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);

  const handleCreate = () => {
    setEditingPkg(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (pkg: any) => {
    setEditingPkg(pkg);
    setIsSheetOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            placeholder="Query tiers..." 
            className="w-full bg-transparent border border-border py-2 pl-9 pr-4 text-sm font-mono focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/50 rounded-none"
          />
        </div>
        <button 
          onClick={handleCreate} 
          className="flex items-center gap-2 bg-text-primary text-base px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors"
        >
          <Plus className="h-4 w-4" /> Define Tier
        </button>
      </div>
      <PackageSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} initialData={editingPkg} />
    </>
  );
}
