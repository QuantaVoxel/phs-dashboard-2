import { ArrowLeft, Activity, Globe, Box } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { CheckNowButton } from "@/components/websites/check-now-button";
import { CopyField } from "@/components/ui/copy-field";
import { ChangeUrlModalButton } from "@/components/websites/change-url-modal";

export default async function WebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock Data
  const site = {
    id,
    name: "Acme Store",
    url: "shop.acme.com",
    status: "OFFLINE",
    platform: "SHOPIFY",
    client: {
      id: "c_1",
      name: "Acme Corp",
      email: "hello@acme.com"
    },
    activePackage: {
      id: "pkg_1",
      name: "Pro Monitoring",
      expiresAt: "2024-12-31"
    }
  };

  const notifications = [
    { id: 1, message: "Acme Store changed status to OFFLINE", time: "10:42 AM", type: "error" },
    { id: 2, message: "System routine check completed", time: "YESTERDAY", type: "info" },
  ];

  const pulseData = Array.from({ length: 48 }, (_, i) => {
    const isError = i > 40;
    const isWarning = i === 40;
    const height = isError ? 10 : isWarning ? 60 : 20 + Math.random() * 20;
    return {
      id: i,
      height,
      status: isError ? "error" : isWarning ? "warning" : "ok"
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
              <StatusBadge status={site.status as any} />
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest bg-surface/20 border border-border px-2 py-0.5">
                {site.platform}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-text-primary mb-2">{site.name}</h1>
            <div className="flex items-center gap-4">
              <a href={`https://${site.url}`} target="_blank" rel="noreferrer" className="font-mono text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-2 w-fit group">
                <Globe className="h-3 w-3" /> https://{site.url}
              </a>
              <ChangeUrlModalButton website={site} variant="outline" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <CheckNowButton websiteId={site.id} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Last Check: 10 mins ago</span>
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
              <span className="text-xl font-light text-text-primary mb-1">{site.activePackage.name}</span>
              <span className="font-mono text-xs text-warning border border-warning/30 bg-warning/10 px-2 py-0.5 w-fit mb-6">
                Expires {site.activePackage.expiresAt}
              </span>
              <Link href={`/packages`} className="font-mono text-[10px] text-text-primary hover:text-brand uppercase tracking-widest flex items-center gap-1 mt-auto">
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
                    <p className="font-mono text-xs text-text-secondary leading-relaxed">{notif.message}</p>
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
