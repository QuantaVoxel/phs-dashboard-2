"use client";

import { useState } from "react";
import { Plus, Search, ArrowRight } from "lucide-react";
import { PackageSheet } from "@/components/packages/package-sheet";
import Link from "next/link";

const MOCK_PACKAGES = [
  { id: "pkg_1", name: "Pro Monitoring", price: 50000, durationDays: 30, description: "5 min intervals + Telegram alerts", isActive: true, usage: 12 },
  { id: "pkg_2", name: "Enterprise Annual", price: 500000, durationDays: 365, description: "1 min intervals + Custom Bot", isActive: true, usage: 3 },
  { id: "pkg_3", name: "Basic Legacy", price: 10000, durationDays: 30, description: "30 min intervals, no alerts", isActive: false, usage: 0 },
];

export default function PackagesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);

  const handleCreate = () => {
    setEditingPkg(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (pkg: any) => {
    setEditingPkg(pkg);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">Service Tiers</h1>
          <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
            Billing packages & capacity planning
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              placeholder="Query tiers..." 
              className="w-full bg-transparent border border-border py-2 pl-9 pr-4 text-sm font-mono focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/50 rounded-none"
            />
          </div>
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-2 bg-text-primary text-base px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors"
          >
            <Plus className="h-4 w-4" /> Define Tier
          </button>
        </div>
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
          {MOCK_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="grid grid-cols-1 lg:grid-cols-12 hover:bg-surface-hover/30 transition-colors group">
              
              {/* Specification */}
              <div className="col-span-1 lg:col-span-5 p-6 lg:p-4 flex flex-col justify-center lg:border-r border-border overflow-hidden">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl font-light tracking-tight text-text-primary truncate">{pkg.name}</span>
                  {!pkg.isActive && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted border border-border px-2 py-0.5">Archived</span>
                  )}
                </div>
                <span className="font-mono text-xs text-text-muted truncate">{pkg.description}</span>
              </div>

              {/* Terms */}
              <div className="col-span-1 lg:col-span-3 px-6 pb-6 lg:p-4 flex flex-col justify-center gap-1 lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Terms</span>
                <span className="text-lg font-light text-text-primary">Rp {pkg.price.toLocaleString('id-ID')}</span>
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">{pkg.durationDays} Days</span>
              </div>

              {/* Adoption */}
              <div className="col-span-1 lg:col-span-2 px-6 pb-6 lg:p-4 flex flex-col justify-center lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Adoption</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-light text-text-primary">{pkg.usage}</span>
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
                  <button onClick={() => handleEdit(pkg)} className="font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors">
                    Edit
                  </button>
                  <Link href={`/packages/${pkg.id}`} className="font-mono text-xs text-text-primary hover:text-brand flex items-center gap-1 uppercase tracking-widest transition-colors">
                    Inspect <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      <PackageSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} initialData={editingPkg} />
    </div>
  );
}
