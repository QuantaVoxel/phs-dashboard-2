import { cn } from "@/lib/utils";

type Status = "ONLINE" | "NOT_FOUND" | "BLOCKED" | "OFFLINE" | "ERROR" | "UNKNOWN";

const statusConfig: Record<Status, { label: string; dotClass: string; textClass: string }> = {
  ONLINE: { label: "Online", dotClass: "bg-success", textClass: "text-text-primary" },
  NOT_FOUND: { label: "Not Found", dotClass: "bg-warning", textClass: "text-warning" },
  BLOCKED: { label: "Blocked", dotClass: "bg-danger", textClass: "text-danger" },
  OFFLINE: { label: "Offline", dotClass: "bg-danger", textClass: "text-danger" },
  ERROR: { label: "Error", dotClass: "bg-danger", textClass: "text-danger" },
  UNKNOWN: { label: "Unknown", dotClass: "bg-neutral-status", textClass: "text-text-muted" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const config = statusConfig[status];
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm font-medium", config.textClass, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]", config.dotClass)} />
      {config.label}
    </div>
  );
}
