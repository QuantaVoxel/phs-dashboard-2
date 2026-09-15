import { cn } from "@/lib/utils";
import { Server, Triangle, Cloud, Hexagon, Globe, Box } from "lucide-react";

type Platform = "VERCEL" | "RAILWAY" | "NETLIFY" | "VPS" | "CPANEL" | "OTHER";

const platformConfig: Record<Platform, { label: string; icon: React.ElementType }> = {
  VERCEL: { label: "Vercel", icon: Triangle },
  RAILWAY: { label: "Railway", icon: Hexagon },
  NETLIFY: { label: "Netlify", icon: Box },
  VPS: { label: "VPS", icon: Server },
  CPANEL: { label: "cPanel", icon: Cloud },
  OTHER: { label: "Other", icon: Globe },
};

export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  const config = platformConfig[platform];
  const Icon = config.icon;
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm text-text-secondary", className)}>
      <Icon className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
      <span>{config.label}</span>
    </div>
  );
}
