"use client";

import { useTransition } from "react";
import { triggerWebsiteCheck } from "@/app/(dashboard)/actions";
import { RefreshCcw } from "lucide-react";

export function CheckNowButton({ websiteId }: { websiteId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await triggerWebsiteCheck(websiteId);
        });
      }}
      disabled={isPending}
      className="font-mono text-[10px] sm:text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5 uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <RefreshCcw className={`h-3 w-3 ${isPending ? 'animate-spin text-text-primary' : 'group-hover:-rotate-90 transition-transform duration-300'}`} />
      {isPending ? 'Queued' : 'Check'}
    </button>
  );
}
