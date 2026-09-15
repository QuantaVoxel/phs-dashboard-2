"use client";

import { useState } from "react";
import { Plus, Search, ArrowRight, RefreshCcw } from "lucide-react";
import { WebsiteSheet } from "@/components/websites/website-sheet";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckNowButton } from "@/components/websites/check-now-button";
import { CheckAllButton } from "@/components/websites/check-all-button";
import { ChangeUrlModalButton } from "@/components/websites/change-url-modal";
import Link from "next/link";

const MOCK_WEBSITES = [
  { id: "w_1", name: "Acme Corp Main", url: "acme.com", status: "ONLINE", platform: "VERCEL", client: "Acme Corp" },
  { id: "w_2", name: "Acme Store", url: "shop.acme.com", status: "OFFLINE", platform: "SHOPIFY", client: "Acme Corp" },
  { id: "w_3", name: "Zenith Blog", url: "zenith.io", status: "NOT_FOUND", platform: "VPS", client: "Zenith LLC" },
];

export default function WebsitesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);

  const handleCreate = () => {
    setEditingSite(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (site: any) => {
    setEditingSite(site);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">Monitored Properties</h1>
          <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
            Uptime tracking & endpoint routing
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              placeholder="Query properties..." 
              className="w-full bg-transparent border border-border py-2 pl-9 pr-4 text-sm font-mono focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/50 rounded-none"
            />
          </div>
          <CheckAllButton />
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-2 bg-text-primary text-base px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors"
          >
            <Plus className="h-4 w-4" /> Register
          </button>
        </div>
      </header>

      {/* Architectural Grid List */}
      <div className="border border-border bg-base flex flex-col">
        {/* Header Row */}
        <div className="hidden lg:grid grid-cols-12 border-b border-border bg-surface/20">
          <div className="col-span-4 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Property Identity</div>
          <div className="col-span-3 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Current State</div>
          <div className="col-span-2 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Context</div>
          <div className="col-span-3 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest text-right">Actions</div>
        </div>

        {/* Data Rows */}
        <div className="flex flex-col divide-y divide-border">
          {MOCK_WEBSITES.map((site) => (
            <div key={site.id} className="grid grid-cols-1 lg:grid-cols-12 hover:bg-surface-hover/30 transition-colors group">
              
              {/* Identity */}
              <div className="col-span-1 lg:col-span-4 p-6 lg:p-4 flex flex-col justify-center lg:border-r border-border overflow-hidden">
                <span className="text-xl font-light tracking-tight text-text-primary mb-1 truncate">{site.name}</span>
                <span className="font-mono text-xs text-text-muted truncate">{site.url}</span>
              </div>

              {/* Status */}
              <div className="col-span-1 lg:col-span-3 px-6 pb-6 lg:p-4 flex flex-col justify-center items-start gap-2 lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden">Status</span>
                <StatusBadge status={site.status as any} />
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mt-1">LAST CHECK: 10 MINS AGO</span>
              </div>

              {/* Context */}
              <div className="col-span-1 lg:col-span-2 px-6 pb-6 lg:p-4 flex flex-col justify-center gap-1 lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Context</span>
                <span className="font-mono text-xs text-text-primary truncate">{site.client}</span>
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">{site.platform}</span>
              </div>

              {/* Actions */}
              <div className="col-span-1 lg:col-span-3 px-6 pb-6 lg:p-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-3">
                <CheckNowButton websiteId={site.id} />
                
                <div className="flex items-center flex-wrap justify-end gap-3 sm:gap-4 mt-2 sm:mt-0">
                  <ChangeUrlModalButton website={site} />
                  <button onClick={() => handleEdit(site)} className="font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors">
                    Edit
                  </button>
                  <Link href={`/websites/${site.id}`} className="font-mono text-xs text-text-primary hover:text-brand flex items-center gap-1 uppercase tracking-widest transition-colors">
                    Inspect <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      <WebsiteSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} initialData={editingSite} />
    </div>
  );
}
