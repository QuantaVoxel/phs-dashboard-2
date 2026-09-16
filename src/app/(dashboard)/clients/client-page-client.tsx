"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { ClientSheet } from "@/components/clients/client-sheet";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function ClientPageClient() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(currentQuery);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== currentQuery) {
        router.push(pathname + "?" + createQueryString("q", searchTerm));
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentQuery, pathname, router, createQueryString]);

  return (
    <>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Query entities..." 
            className="w-full bg-transparent border border-border py-2 pl-9 pr-4 text-sm font-mono focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/50 rounded-none"
          />
        </div>
        <button 
          onClick={() => setIsSheetOpen(true)} 
          className="flex items-center gap-2 bg-text-primary text-base px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors"
        >
          <Plus className="h-4 w-4" /> Define Entity
        </button>
      </div>
      <ClientSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
