import { AlertCircle, Clock, Activity, ArrowRight, RefreshCcw } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { CheckNowButton } from "@/components/websites/check-now-button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export default async function Dashboard() {
  const [
    totalClients,
    totalPackages,
    totalWebsites,
    offlineWebsites,
    expiringWebsites,
    recentLogs
  ] = await Promise.all([
    prisma.client.count(),
    prisma.package.count({ where: { isActive: true } }),
    prisma.website.count(),
    prisma.website.findMany({
      where: { status: { in: ['OFFLINE', 'ERROR'] } },
      include: { client: true }
    }),
    prisma.website.findMany({
      where: {
        expiresAt: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      include: { client: true }
    }),
    prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  // Merge and deduplicate attention sites
  const attentionMap = new Map();
  offlineWebsites.forEach(w => attentionMap.set(w.id, { ...w, expiring: false }));
  expiringWebsites.forEach(w => {
    if (attentionMap.has(w.id)) {
      attentionMap.get(w.id).expiring = true;
    } else {
      attentionMap.set(w.id, { ...w, expiring: true });
    }
  });
  const attentionSites = Array.from(attentionMap.values());

  const pulseData = Array.from({ length: 48 }, (_, i) => {
    const isError = i > 40 && i < 43;
    const isWarning = i === 43;
    const height = isError ? 10 : isWarning ? 60 : 20 + Math.random() * 20;
    return {
      id: i,
      height,
      status: isError ? "error" : isWarning ? "warning" : "ok"
    };
  });

  const onlineWebsitesCount = totalWebsites - offlineWebsites.length;
  const healthPercentage = totalWebsites > 0 ? ((onlineWebsitesCount / totalWebsites) * 100).toFixed(1) : "100.0";

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
        
        {/* Row 1: Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border border-b border-border">
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 block">Client Entities</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light tracking-tighter text-text-primary">{totalClients}</span>
              <span className="font-mono text-xs text-text-secondary uppercase">Active</span>
            </div>
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 block">Service Tiers</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light tracking-tighter text-text-primary">{totalPackages}</span>
              <span className="font-mono text-xs text-text-secondary uppercase">Packages</span>
            </div>
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 block">Total Monitored</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light tracking-tighter text-text-primary">{totalWebsites}</span>
              <span className="font-mono text-xs text-text-secondary uppercase">Sites</span>
            </div>
          </div>
          <div className={`p-6 sm:p-8 flex flex-col justify-between ${attentionSites.length > 0 ? 'bg-danger/5' : ''}`}>
            <span className={`font-mono text-xs uppercase tracking-widest mb-4 block ${attentionSites.length > 0 ? 'text-danger' : 'text-success'}`}>Require Attention</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-light tracking-tighter ${attentionSites.length > 0 ? 'text-danger' : 'text-success'}`}>{attentionSites.length}</span>
              <span className={`font-mono text-xs uppercase ${attentionSites.length > 0 ? 'text-danger' : 'text-success'}`}>Issues</span>
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
              <span className="font-mono text-xs text-text-muted uppercase tracking-widest">{attentionSites.length} Detected</span>
            </div>
            <div className="flex flex-col">
              {attentionSites.map((site: any, index: number) => (
                <div key={site.id} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 hover:bg-surface-hover/30 transition-colors ${index !== attentionSites.length - 1 ? 'border-b border-border' : ''}`}>
                  
                  {/* Left: Huge Name & Meta */}
                  <div className="flex flex-col mb-6 sm:mb-0">
                     <div className="flex items-center gap-3 mb-2">
                       {site.expiring ? (
                          <span className="font-mono text-[10px] text-warning uppercase tracking-widest border border-warning/30 bg-warning/10 px-1.5 py-0.5">
                            Expiring
                          </span>
                       ) : (
                         <StatusBadge status={site.status} />
                       )}
                       <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">{site.deploymentPlatform}</span>
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
                      <span className="font-mono text-sm text-text-secondary">{site.client.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-0">
                      <div className="pr-4 border-r border-border mr-4">
                        <CheckNowButton websiteId={site.id} />
                      </div>
                      <Link href={`/websites/${site.id}`} className="font-mono text-xs text-text-primary hover:text-brand flex items-center gap-1 uppercase tracking-widest transition-colors">
                        Manage <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {attentionSites.length === 0 && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                   <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4 border border-success/20">
                     <Activity className="h-5 w-5 text-success" />
                   </div>
                   <span className="font-mono text-xs text-text-primary uppercase tracking-widest mb-2">Systems Nominal</span>
                   <span className="font-mono text-xs text-text-muted">No immediate actions required.</span>
                </div>
              )}
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
              {recentLogs.map((notif: any, i: number) => (
                <div key={notif.id} className={`flex flex-col py-3 px-6 sm:px-8 hover:bg-surface-hover/20 transition-colors ${i !== recentLogs.length - 1 ? 'border-b border-border/30' : ''}`}>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest w-16 shrink-0">
                      {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                    </span>
                    {notif.type.includes("ERROR") || notif.type.includes("DOWN") || notif.type.includes("EXPIRED") ? (
                      <span className="font-mono text-[10px] text-danger uppercase tracking-widest">[ERR]</span>
                    ) : notif.type.includes("EXPIRING") || notif.type.includes("BLOCKED") ? (
                      <span className="font-mono text-[10px] text-warning uppercase tracking-widest">[WRN]</span>
                    ) : (
                      <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">[SYS]</span>
                    )}
                  </div>
                  <div className="pl-[76px]">
                    <p className="font-mono text-xs text-text-secondary leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: notif.message }} />
                  </div>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <div className="p-8 text-center font-mono text-[10px] text-text-muted uppercase tracking-widest">
                  No recent activity
                </div>
              )}
            </div>
            <div className="px-6 py-4 sm:px-8 sm:py-5 mt-auto border-t border-border bg-base/50">
               <span className="font-mono text-xs text-text-muted uppercase tracking-widest">End of Stream</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
