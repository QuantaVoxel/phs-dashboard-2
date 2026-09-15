import { Search, MessageCircle, Send, ArrowRight, Plus } from "lucide-react";
import { CredentialsModalButton } from "@/components/clients/credentials-modal";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClientPageClient } from "./client-page-client";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: { websites: true, notificationLogs: true }
      },
      websites: {
        select: { status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">Entity Roster</h1>
          <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
            Client definitions and contact routing
          </p>
        </div>
        <ClientPageClient />
      </header>

      {/* Architectural Grid List */}
      <div className="border border-border bg-base flex flex-col">
        {/* Header Row */}
        <div className="hidden lg:grid grid-cols-12 border-b border-border bg-surface/20">
          <div className="col-span-4 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Entity Identity</div>
          <div className="col-span-3 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Routing Context</div>
          <div className="col-span-2 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest border-r border-border">Capacity</div>
          <div className="col-span-3 p-4 font-mono text-[10px] uppercase text-text-muted tracking-widest text-right">Access Gateway</div>
        </div>

        {/* Data Rows */}
        <div className="flex flex-col divide-y divide-border">
          {clients.map((client) => {
            const hasCustomToken = !!client.telegramBotToken;
            return (
              <div key={client.id} className="grid grid-cols-1 lg:grid-cols-12 hover:bg-surface-hover/30 transition-colors group">
                
                {/* Identity */}
                <div className="col-span-1 lg:col-span-4 p-6 lg:p-4 flex flex-col justify-center lg:border-r border-border">
                  <span className="text-xl font-light tracking-tight text-text-primary mb-1">{client.name}</span>
                  <span className="font-mono text-xs text-text-muted">{client.email || 'No Email'}</span>
                </div>

                {/* Routing / Auth */}
                <div className="col-span-1 lg:col-span-4 px-6 pb-6 lg:p-4 flex flex-col justify-center gap-2 lg:border-r border-border">
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Routing Auth</span>
                  
                  <div className="flex items-center justify-between group/row">
                    <div className="flex items-center gap-2">
                      <Send className="h-3 w-3 text-text-muted" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">TG ID: {client.telegramChatId || 'Not Set'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group/row">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasCustomToken ? 'bg-success' : 'bg-text-muted'}`} />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
                        {hasCustomToken ? 'Custom Bot Token' : 'Default Sys Token'}
                      </span>
                    </div>
                    {hasCustomToken && (
                      <div className="opacity-100 lg:opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <CredentialsModalButton client={client} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Capacity */}
                <div className="col-span-1 lg:col-span-2 px-6 pb-6 lg:p-4 flex flex-col justify-center lg:border-r border-border">
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Capacity</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-light text-text-primary">{client._count.websites}</span>
                    <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">Properties</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 lg:col-span-2 px-6 pb-6 lg:p-4 flex items-center justify-start lg:justify-end">
                  <Link href={`/clients/${client.id}`} className="font-mono text-xs text-text-primary hover:text-brand flex items-center gap-1 uppercase tracking-widest transition-colors">
                    Inspect <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            );
          })}
          {clients.length === 0 && (
            <EmptyState 
              title="No Entities Found" 
              description="You have not registered any client entities yet. Add a client to begin routing notifications." 
              icon={<Search className="h-6 w-6 text-text-muted" />}
              className="border-t border-border bg-base"
            />
          )}
        </div>
      </div>
    </div>
  );
}
