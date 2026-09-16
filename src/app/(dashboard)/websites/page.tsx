import { Search, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckNowButton } from "@/components/websites/check-now-button";
import { ChangeUrlModalButton } from "@/components/websites/change-url-modal";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WebsitePageClient } from "./website-page-client";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";

export default async function WebsitesPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q : "";

  const websites = await prisma.website.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { url: { contains: q, mode: 'insensitive' } },
        { client: { name: { contains: q, mode: 'insensitive' } } },
      ]
    } : {},
    include: {
      client: true,
      package: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">Monitored Properties</h1>
          <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
            Uptime tracking & endpoint routing
          </p>
        </div>
        <WebsitePageClient />
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
          {websites.map((site) => (
            <div key={site.id} className="grid grid-cols-1 lg:grid-cols-12 hover:bg-surface-hover/30 transition-colors group">
              
              {/* Identity */}
              <div className="col-span-1 lg:col-span-4 p-6 lg:p-4 flex flex-col justify-center lg:border-r border-border overflow-hidden">
                <span className="text-xl font-light tracking-tight text-text-primary mb-1 truncate">{site.name}</span>
                <span className="font-mono text-xs text-text-muted truncate">{site.url}</span>
              </div>

              {/* Status */}
              <div className="col-span-1 lg:col-span-3 px-6 pb-6 lg:p-4 flex flex-col justify-center items-start gap-2 lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden">Status</span>
                <StatusBadge status={site.status} />
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mt-1">
                  LAST CHECK: {site.lastCheckedAt ? formatDistanceToNow(site.lastCheckedAt, { addSuffix: true }) : 'NEVER'}
                </span>
              </div>

              {/* Context */}
              <div className="col-span-1 lg:col-span-2 px-6 pb-6 lg:p-4 flex flex-col justify-center gap-1 lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Context</span>
                <span className="font-mono text-xs text-text-primary truncate">{site.client.name}</span>
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">{site.deploymentPlatform}</span>
              </div>

              {/* Actions */}
              <div className="col-span-1 lg:col-span-3 px-6 pb-6 lg:p-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-3">
                <CheckNowButton websiteId={site.id} />
                
                <div className="flex items-center flex-wrap justify-end gap-3 sm:gap-4 mt-2 sm:mt-0">
                  <ChangeUrlModalButton website={{ id: site.id, url: site.url }} />
                  <Link href={`/websites/${site.id}`} className="font-mono text-xs text-text-primary hover:text-brand flex items-center gap-1 uppercase tracking-widest transition-colors">
                    Inspect <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
          {websites.length === 0 && (
            <EmptyState 
              title="No Monitored Properties" 
              description={q ? `No websites match the search query "${q}".` : "You have not registered any websites for uptime tracking. Add a property to begin monitoring."}
              icon={<Search className="h-6 w-6 text-text-muted" />}
              className="border-t border-border bg-base"
            />
          )}
        </div>
      </div>
    </div>
  );
}
