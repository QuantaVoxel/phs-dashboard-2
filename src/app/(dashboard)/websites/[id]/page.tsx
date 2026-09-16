import { ArrowLeft, Globe, Activity } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { CheckNowButton } from "@/components/websites/check-now-button";
import { ChangeUrlModalButton } from "@/components/websites/change-url-modal";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default async function WebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const site = await prisma.website.findUnique({
    where: { id },
    include: {
      client: true,
      package: true,
      notificationLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  });

  if (!site) {
    return notFound();
  }

  const notifications = site.notificationLogs.map((log) => ({
    id: log.id,
    message: log.message,
    time: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }),
    type: log.type.toLowerCase(),
  }));

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const pulseLogs = await prisma.notificationLog.findMany({
    where: { 
      websiteId: id,
      createdAt: { gte: last24h } 
    },
    select: { createdAt: true, type: true }
  });

  const pulseData = Array.from({ length: 48 }, (_, i) => {
    const blockStart = new Date(last24h.getTime() + i * 30 * 60 * 1000);
    const blockEnd = new Date(blockStart.getTime() + 30 * 60 * 1000);
    
    const logsInBlock = pulseLogs.filter(log => log.createdAt >= blockStart && log.createdAt < blockEnd);
    
    const hasError = logsInBlock.some(log => log.type.includes("DOWN") || log.type.includes("ERROR") || log.type.includes("EXPIRED"));
    const hasWarning = logsInBlock.some(log => log.type.includes("BLOCKED") || log.type.includes("EXPIRING"));
    
    const height = hasError ? 80 : hasWarning ? 50 : 15 + Math.random() * 15;
    
    return {
      id: i,
      height,
      status: hasError ? "error" : hasWarning ? "warning" : "ok"
    };
  });

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl space-y-10">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-6">
        <Link href="/websites" className="font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-2 group transition-colors w-fit">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to properties
        </Link>
        
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <StatusBadge status={site.status} />
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest bg-surface/20 border border-border px-2 py-0.5">
                {site.deploymentPlatform}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-text-primary mb-2">{site.name}</h1>
            <div className="flex items-center gap-4">
              <a href={`https://${site.url}`} target="_blank" rel="noreferrer" className="font-mono text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-2 w-fit group">
                <Globe className="h-3 w-3" /> https://{site.url}
              </a>
              <ChangeUrlModalButton website={{ id: site.id, url: site.url }} variant="outline" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <CheckNowButton websiteId={site.id} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Last Check: {site.lastCheckedAt ? formatDistanceToNow(site.lastCheckedAt, { addSuffix: true }) : 'Never'}
            </span>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Metrics & Config */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* Pulse Chart */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center gap-2">
                 Uptime Pulse (48h)
              </span>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full" /> OK</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-danger rounded-full" /> ERR</span>
              </div>
            </div>
            <div className="border border-border bg-[#020202] p-6 h-40 flex items-end gap-1">
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

          {/* Infrastructure Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col border border-border bg-base p-6">
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-4">Client Ownership</span>
              <span className="text-xl font-light text-text-primary mb-1">{site.client.name}</span>
              <span className="font-mono text-xs text-text-muted mb-6">{site.client.email}</span>
              <Link href={`/clients/${site.client.id}`} className="font-mono text-[10px] text-text-primary hover:text-brand uppercase tracking-widest flex items-center gap-1 mt-auto">
                Inspect Entity &rarr;
              </Link>
            </div>
            
            <div className="flex flex-col border border-border bg-base p-6">
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-4">Active Package</span>
              <span className="text-xl font-light text-text-primary mb-1">{site.package.name}</span>
              <span className="font-mono text-xs text-warning border border-warning/30 bg-warning/10 px-2 py-0.5 w-fit mb-6">
                Expires {site.expiresAt ? site.expiresAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Lifetime'}
              </span>
              <Link href={`/packages/${site.package.id}`} className="font-mono text-[10px] text-text-primary hover:text-brand uppercase tracking-widest flex items-center gap-1 mt-auto">
                Manage Billing &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Notification Log */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-text-muted" /> Property Log
            </span>
          </div>
          
          <div className="flex flex-col bg-[#020202] border border-border">
            <div className="flex flex-col divide-y divide-border/30 max-h-[600px] overflow-y-auto">
              {notifications.map((notif, i) => (
                <div key={notif.id} className="flex flex-col py-3 px-6 hover:bg-surface-hover/20 transition-colors">
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
                    <div className="font-mono text-xs text-text-secondary leading-relaxed whitespace-pre-wrap [&>b]:text-text-primary [&>a]:text-brand [&>a]:hover:underline" dangerouslySetInnerHTML={{ __html: notif.message }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
