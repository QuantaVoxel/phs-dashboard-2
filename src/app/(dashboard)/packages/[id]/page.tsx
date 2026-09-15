import { ArrowLeft, Users, History, Activity } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { notFound } from "next/navigation";

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const pkg = await prisma.package.findUnique({
    where: { id },
    include: {
      websites: {
        include: {
          client: true
        }
      },
      history: {
        include: {
          website: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  });

  if (!pkg) {
    return notFound();
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl space-y-10">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-6">
        <Link href="/packages" className="font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-2 group transition-colors w-fit">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to tiers
        </Link>
        
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className={`w-2 h-2 rounded-full ${pkg.isActive ? 'bg-success' : 'bg-text-muted'}`} />
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest bg-surface/20 border border-border px-2 py-0.5">
                {pkg.isActive ? 'Available for Assignment' : 'Archived / Deprecated'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-text-primary mb-3">{pkg.name}</h1>
            <p className="font-mono text-sm text-text-muted max-w-2xl">{pkg.description || 'No description provided.'}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 bg-base border border-border p-6 min-w-[200px]">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2">Commercial Terms</span>
            <span className="text-4xl font-light text-text-primary">Rp {Number(pkg.price).toLocaleString('id-ID')}</span>
            <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">/ {pkg.durationDays} Days</span>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Active Subscribers */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center gap-2">
               <Users className="h-3.5 w-3.5 text-text-muted" /> Active Assignments ({pkg.websites.length})
            </span>
          </div>
          
          <div className="border border-border flex flex-col divide-y divide-border/50">
            {pkg.websites.map(sub => (
              <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-surface-hover/30 transition-colors group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={sub.status} />
                    <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">{sub.client.name}</span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-xl font-light tracking-tight text-text-primary">{sub.name}</span>
                  </div>
                  <span className="font-mono text-xs text-text-muted">{sub.url}</span>
                </div>
                
                <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Expiration</span>
                  <span className="font-mono text-sm text-text-primary">
                    {sub.expiresAt ? sub.expiresAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Lifetime'}
                  </span>
                  <Link href={`/websites/${sub.id}`} className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-brand mt-2 transition-colors">
                    Inspect Property &rarr;
                  </Link>
                </div>
              </div>
            ))}
            
            {pkg.websites.length === 0 && (
              <EmptyState 
                title="No Active Assignments" 
                description="No websites are currently assigned to this package." 
                icon={<Activity className="h-6 w-6 text-text-muted" />}
                className="py-12"
              />
            )}
          </div>
        </div>

        {/* Right Column: Ledger / History */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-text-muted" /> Ledger History
            </span>
          </div>
          
          <div className="flex flex-col bg-[#020202] border border-border">
            <div className="flex flex-col divide-y divide-border/30 max-h-[600px] overflow-y-auto">
              {pkg.history.map((item) => (
                <div key={item.id} className="flex flex-col py-4 px-6 hover:bg-surface-hover/20 transition-colors">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-mono text-[10px] text-success uppercase tracking-widest">
                      [ASSIGNED]
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {item.createdAt.toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-text-primary truncate mr-4">{item.website.name}</p>
                    <span className="font-mono text-xs text-text-secondary whitespace-nowrap">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
              {pkg.history.length === 0 && (
                <EmptyState 
                  title="No History" 
                  description="No history recorded." 
                  icon={<Activity className="h-6 w-6 text-text-muted" />}
                  className="py-12"
                />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
