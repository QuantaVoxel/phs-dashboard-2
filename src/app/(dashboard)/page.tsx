import { AlertCircle, Clock, Activity, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { CheckNowButton } from "@/components/websites/check-now-button";
import Link from "next/link";

// Mock Data
const MOCK_ATTENTION_SITES = [
  { id: 1, name: "Acme Corp Main", url: "acme.com", client: "Acme Corp", status: "OFFLINE", platform: "VERCEL", latency: 0 },
  { id: 2, name: "Zenith Blog", url: "zenith.io", client: "Zenith LLC", status: "NOT_FOUND", platform: "VPS", latency: 404 },
  { id: 3, name: "Global Shop", url: "global.store", client: "Global Inc", status: "ONLINE", platform: "RAILWAY", expiring: true, latency: 120 },
] as const;

const MOCK_NOTIFICATIONS = [
  { id: 1, message: "Acme Corp Main changed status to OFFLINE", time: "10:42 AM", type: "error" },
  { id: 2, message: "Global Shop package expires in 3 days", time: "09:15 AM", type: "warning" },
  { id: 3, message: "Zenith Blog changed status to NOT_FOUND", time: "YESTERDAY", type: "warning" },
  { id: 4, message: "System routine check completed", time: "YESTERDAY", type: "info" },
];

// Generate fake sparkline data for the Pulse Chart
const pulseData = Array.from({ length: 60 }, (_, i) => {
  // Mostly healthy (green), some spikes (yellow/red)
  const isError = i === 12 || i === 45;
  const isWarning = i === 13 || i === 44 || i === 46;
  const height = isError ? 10 : isWarning ? 60 : 20 + Math.random() * 20;
  return {
    id: i,
    height,
    status: isError ? "error" : isWarning ? "warning" : "ok"
  };
});

export default function Dashboard() {
  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-text-primary">Global Status</h1>
        <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
          System monitoring & billing oversight
        </p>
      </header>

      {/* Architectural Grid Layout */}
      <div className="border border-border bg-base flex flex-col">
        
        {/* Row 1: Key Metrics (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-border divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 block">Network Health</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light tracking-tighter text-success">98.4%</span>
              <span className="font-mono text-xs text-text-secondary uppercase">Online</span>
            </div>
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 block">Active Monitored</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light tracking-tighter text-text-primary">86</span>
              <span className="font-mono text-xs text-text-secondary uppercase">Sites</span>
            </div>
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-danger/5">
            <span className="font-mono text-xs text-danger uppercase tracking-widest mb-4 block">Require Attention</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light tracking-tighter text-danger">3</span>
              <span className="font-mono text-xs text-danger uppercase">Issues</span>
            </div>
          </div>
        </div>

        {/* Row 2: Pulse Chart Widget */}
        <div className="border-b border-border p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">System Pulse (Last 24h)</span>
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-success rounded-full" /> Healthy</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-warning rounded-full" /> Degraded</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-danger rounded-full" /> Outage</span>
            </div>
          </div>
          
          <div className="h-24 flex items-end gap-1 sm:gap-1.5 w-full">
            {pulseData.map((data) => (
              <div 
                key={data.id}
                className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
                style={{ 
                  height: `${data.height}%`,
                  backgroundColor: data.status === 'error' ? 'var(--danger)' : data.status === 'warning' ? 'var(--warning)' : 'var(--success)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Row 3: Split Data Views */}
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          {/* Action Required List */}
          <div className="lg:col-span-3">
            <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-border flex items-center justify-between">
              <span className="font-mono text-xs text-text-muted uppercase tracking-widest">Action Required</span>
              <span className="font-mono text-xs text-text-muted uppercase tracking-widest">{MOCK_ATTENTION_SITES.length} Detected</span>
            </div>
            <div className="flex flex-col">
              {MOCK_ATTENTION_SITES.map((site, index) => (
                <div key={site.id} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 hover:bg-surface-hover/30 transition-colors ${index !== MOCK_ATTENTION_SITES.length - 1 ? 'border-b border-border' : ''}`}>
                  
                  {/* Left: Huge Name & Meta */}
                  <div className="flex flex-col mb-6 sm:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      {'expiring' in site && site.expiring ? (
                         <span className="font-mono text-[10px] text-warning uppercase tracking-widest border border-warning/30 bg-warning/10 px-1.5 py-0.5">
                           Expiring
                         </span>
                      ) : (
                        <StatusBadge status={site.status as any} />
                      )}
                      <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">{site.platform}</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-light tracking-tight text-text-primary">{site.name}</span>
                      <span className="hidden sm:inline-block font-mono text-sm text-text-muted">{site.url}</span>
                    </div>
                    <span className="sm:hidden font-mono text-sm text-text-muted mt-1">{site.url}</span>
                  </div>
                  
                  {/* Right: Client & Actions */}
                  <div className="flex items-end sm:items-center gap-6 sm:gap-10">
                    <div className="hidden md:flex flex-col text-right">
                      <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Client</span>
                      <span className="font-mono text-sm text-text-secondary">{site.client}</span>
                    </div>
                    
                    <div className="flex items-center gap-0">
                      <div className="pr-4 border-r border-border mr-4">
                        <CheckNowButton websiteId={site.id.toString()} />
                      </div>
                      <Link href={`/websites/${site.id}`} className="font-mono text-xs text-text-primary hover:text-brand flex items-center gap-1 uppercase tracking-widest transition-colors">
                        Manage <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="flex flex-col bg-[#020202]">
            <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-border flex items-center justify-between">
              <span className="font-mono text-xs text-text-muted uppercase tracking-widest">Activity Stream</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="font-mono text-[10px] text-success uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              {MOCK_NOTIFICATIONS.map((notif, i) => (
                <div key={notif.id} className={`flex flex-col py-3 px-6 sm:px-8 hover:bg-surface-hover/20 transition-colors ${i !== MOCK_NOTIFICATIONS.length - 1 ? 'border-b border-border/30' : ''}`}>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest w-16 shrink-0">{notif.time}</span>
                    {notif.type === "error" ? (
                      <span className="font-mono text-[10px] text-danger uppercase tracking-widest">[ERR]</span>
                    ) : notif.type === "warning" ? (
                      <span className="font-mono text-[10px] text-warning uppercase tracking-widest">[WRN]</span>
                    ) : (
                      <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">[SYS]</span>
                    )}
                  </div>
                  <div className="pl-[76px]">
                    <p className="font-mono text-xs text-text-secondary leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 sm:px-8 sm:py-5 mt-auto border-t border-border bg-base/50">
               <Link href="/settings" className="font-mono text-xs text-text-muted hover:text-text-primary flex items-center justify-between uppercase tracking-widest group">
                 <span>View full log history</span>
                 <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
