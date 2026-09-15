"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Globe, Package, Settings, Activity, Power } from "lucide-react";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Client Roster", href: "/clients", icon: Users },
  { name: "Properties", href: "/websites", icon: Globe },
  { name: "Service Tiers", href: "/packages", icon: Package },
  { name: "Configuration", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-[#020202] h-full justify-between">
      
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex h-14 items-center px-6 border-b border-border bg-[#000000]">
          <Activity className="mr-3 h-4 w-4 text-brand" />
          <span className="font-mono text-sm uppercase tracking-widest text-text-primary">PHS Core</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col space-y-0 p-4">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-4 px-3">System Routing</span>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 text-xs font-mono uppercase tracking-widest transition-all",
                  isActive
                    ? "text-brand bg-brand/5 border-l-2 border-brand"
                    : "text-text-secondary border-l-2 border-transparent hover:text-text-primary hover:bg-surface/50"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2 : 1.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-6 border-t border-border bg-[#000000]">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Active Session</span>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase tracking-widest text-text-primary">Admin_01</span>
              <span className="text-[10px] font-mono text-text-muted">admin@phs.com</span>
            </div>
            <button className="text-text-muted hover:text-danger transition-colors p-2 border border-border hover:border-danger hover:bg-danger/10">
              <Power className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
}
