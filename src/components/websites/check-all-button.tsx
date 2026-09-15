"use client";

import { useTransition } from "react";
import { RefreshCcw } from "lucide-react";
// import { triggerGlobalCheck } from "@/app/(dashboard)/actions";

export function CheckAllButton() {
  const [isPending, startTransition] = useTransition();

  const handleCheckAll = () => {
    startTransition(async () => {
      // await triggerGlobalCheck();
      // Simulating a global check queue for now
      await new Promise(resolve => setTimeout(resolve, 1500));
    });
  };

  return (
    <button 
      onClick={handleCheckAll}
      disabled={isPending}
      className="flex items-center gap-2 border border-border bg-transparent text-text-primary px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-surface transition-colors disabled:opacity-50"
    >
      <RefreshCcw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} /> 
      {isPending ? 'Queuing...' : 'Check All'}
    </button>
  );
}
