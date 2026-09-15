import { ArrowLeft, Users, History, Activity } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock Data
  const pkg = {
    id,
    name: "Pro Monitoring",
    price: 50000,
    durationDays: 30,
    description: "5 min intervals + Telegram alerts. Premium SLA.",
    isActive: true,
  };

  const activeSubscribers = [
    { id: "w_1", name: "Acme Corp Main", url: "acme.com", status: "ONLINE", client: "Acme Corp", expiresAt: "2024-12-31" },
    { id: "w_2", name: "Acme Store", url: "shop.acme.com", status: "OFFLINE", client: "Acme Corp", expiresAt: "2024-11-15" },
    { id: "w_4", name: "Global Logistics", url: "global.store", status: "ONLINE", client: "Global Inc", expiresAt: "2025-01-20" },
  ];

  const subscriptionHistory = [
    { id: 1, action: "SUBSCRIBED", site: "Acme Corp Main", date: "2024-12-01", amount: "Rp 50.000" },
    { id: 2, action: "RENEWED", site: "Acme Store", date: "2024-10-15", amount: "Rp 50.000" },
    { id: 3, action: "EXPIRED", site: "Old Blog", date: "2024-09-01", amount: "Rp 0" },
  ];

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
            <p className="font-mono text-sm text-text-muted max-w-2xl">{pkg.description}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 bg-base border border-border p-6 min-w-[200px]">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2">Commercial Terms</span>
            <span className="text-4xl font-light text-text-primary">Rp {pkg.price.toLocaleString('id-ID')}</span>
            <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">/ {pkg.durationDays} Days</span>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Active Subscribers */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center gap-2">
               <Users className="h-3.5 w-3.5 text-text-muted" /> Active Assignments ({activeSubscribers.length})
            </span>
          </div>
          
          <div className="border border-border flex flex-col divide-y divide-border/50">
            {activeSubscribers.map(sub => (
              <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-surface-hover/30 transition-colors group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={sub.status as any} />
                    <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">{sub.client}</span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-xl font-light tracking-tight text-text-primary">{sub.name}</span>
                  </div>
                  <span className="font-mono text-xs text-text-muted">{sub.url}</span>
                </div>
                
                <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1">Expiration</span>
                  <span className="font-mono text-sm text-text-primary">{sub.expiresAt}</span>
                  <Link href={`/websites/${sub.id}`} className="font-mono text-[10px] uppercase tracking-widest text-text-muted hover:text-brand mt-2 transition-colors">
                    Inspect Property &rarr;
                  </Link>
                </div>
              </div>
            ))}
            
            {activeSubscribers.length === 0 && (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-2">
                <Activity className="h-8 w-8 text-text-muted/30" />
                <span className="font-mono text-xs text-text-muted uppercase tracking-widest">No active assignments</span>
              </div>
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
              {subscriptionHistory.map((item) => (
                <div key={item.id} className="flex flex-col py-4 px-6 hover:bg-surface-hover/20 transition-colors">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className={`font-mono text-[10px] uppercase tracking-widest ${item.action === 'EXPIRED' ? 'text-danger' : 'text-success'}`}>
                      [{item.action}]
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">{item.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-text-primary">{item.site}</p>
                    <span className="font-mono text-xs text-text-secondary">{item.amount}</span>
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
