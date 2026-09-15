import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PackagePageClient } from "./package-page-client";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    include: {
      _count: {
        select: { websites: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">Service Tiers</h1>
          <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
            Billing packages & capacity planning
          </p>
        </div>
        <PackagePageClient packages={packages} />
      </header>

      {/* Architectural Grid List */}
      <div className="border border-border bg-base flex flex-col">
        {/* Header Row */}
        <div className="hidden lg:grid grid-cols-12 border-b border-border bg-surface/20">
          <div className="col-span-5 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Tier Specification</div>
          <div className="col-span-3 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Commercial Terms</div>
          <div className="col-span-2 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Adoption</div>
          <div className="col-span-2 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest text-right">Actions</div>
        </div>

        {/* Data Rows */}
        <div className="flex flex-col divide-y divide-border">
          {packages.map((pkg) => (
            <div key={pkg.id} className="grid grid-cols-1 lg:grid-cols-12 hover:bg-surface-hover/30 transition-colors group">
              
              {/* Specification */}
              <div className="col-span-1 lg:col-span-5 p-6 lg:p-4 flex flex-col justify-center lg:border-r border-border overflow-hidden">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl font-light tracking-tight text-text-primary truncate">{pkg.name}</span>
                  {!pkg.isActive && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted border border-border px-2 py-0.5">Archived</span>
                  )}
                </div>
                <span className="font-mono text-xs text-text-muted truncate">{pkg.description || 'No description'}</span>
              </div>

              {/* Terms */}
              <div className="col-span-1 lg:col-span-3 px-6 pb-6 lg:p-4 flex flex-col justify-center gap-1 lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Terms</span>
                <span className="text-lg font-light text-text-primary">Rp {Number(pkg.price).toLocaleString('id-ID')}</span>
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">{pkg.durationDays} Days</span>
              </div>

              {/* Adoption */}
              <div className="col-span-1 lg:col-span-2 px-6 pb-6 lg:p-4 flex flex-col justify-center lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Adoption</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-light text-text-primary">{pkg._count.websites}</span>
                  <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">Sites</span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1 lg:col-span-2 px-6 pb-6 lg:p-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pkg.isActive ? 'bg-success' : 'bg-text-muted'}`} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted whitespace-nowrap">
                    {pkg.isActive ? 'Available' : 'Deprecated'}
                  </span>
                </div>
                
                <div className="flex items-center flex-wrap justify-end gap-3 sm:gap-4 mt-2 sm:mt-0">
                  <Link href={`/packages/${pkg.id}`} className="font-mono text-xs text-text-primary hover:text-brand flex items-center gap-1 uppercase tracking-widest transition-colors">
                    Inspect <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
          {packages.length === 0 && (
            <EmptyState 
              title="No Service Tiers" 
              description="No billing packages have been created. Define a service tier to assign to properties."
              className="border-t border-border bg-base" 
            />
          )}
        </div>
      </div>
    </div>
  );
}
