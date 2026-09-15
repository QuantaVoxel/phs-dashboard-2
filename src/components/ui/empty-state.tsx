import { FileX } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 sm:p-20 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-surface/20 flex items-center justify-center mb-6 border border-border">
        {icon || <FileX className="h-6 w-6 text-text-muted" />}
      </div>
      <span className="font-mono text-sm text-text-primary uppercase tracking-widest mb-2">{title}</span>
      <span className="font-mono text-xs text-text-muted max-w-sm leading-relaxed">{description}</span>
    </div>
  );
}
