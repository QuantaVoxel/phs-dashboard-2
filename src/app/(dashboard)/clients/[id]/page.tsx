import { MessageCircle, Send, Plus, ArrowLeft, Globe, Activity, Clock, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { CheckNowButton } from "@/components/websites/check-now-button";
import { CopyField } from "@/components/ui/copy-field";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClientEditButton } from "./client-edit-button";
import { AddWebsiteButton } from "./add-website-button";
import { ClientDeleteButton } from "../client-delete-button";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      websites: true,
      notificationLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  });

  if (!client) {
    return notFound();
  }

  const hasCustomToken = !!client.telegramBotToken;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl space-y-10">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-6">
        <Link href="/clients" className="font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-2 group transition-colors w-fit">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to roster
        </Link>
        
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-text-primary">{client.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="font-mono text-xs text-text-muted uppercase tracking-widest">{client.email || 'No Email'}</span>
              {client.whatsappNumber && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 text-text-muted" />
                  <span className="font-mono text-[10px] text-text-secondary">{client.whatsappNumber}</span>
                </div>
              )}
              {client.telegramChatId && (
                <div className="flex items-center gap-1">
                  <Send className="h-3 w-3 text-text-muted" />
                  <span className="font-mono text-[10px] text-text-secondary">{client.telegramChatId}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-3 justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
              <span className={`w-1.5 h-1.5 rounded-full ${hasCustomToken ? 'bg-success' : 'bg-text-muted'}`} />
              {hasCustomToken ? 'Custom Bot Token' : 'System Default Token'}
            </div>
            <div className="flex items-center gap-3">
              <ClientDeleteButton clientId={client.id} clientName={client.name} redirectAfterDelete={true} />
              <ClientEditButton client={client} />
            </div>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Websites */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-text-muted" /> Monitored Properties
            </span>
            <AddWebsiteButton clientId={client.id} />
          </div>
          
          <div className="border border-border flex flex-col divide-y divide-border/50">
            {client.websites.map(site => (
              <div key={site.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-surface-hover/30 transition-colors group">
                <div className="flex flex-col gap-1 mb-4 sm:mb-0">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={site.status} />
                    <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">{site.deploymentPlatform}</span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-xl font-light tracking-tight text-text-primary">{site.name}</span>
                  </div>
                  <span className="font-mono text-sm text-text-muted">{site.url}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <CheckNowButton websiteId={site.id} />
                  <Link href={`/websites/${site.id}`} className="font-mono text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:bg-surface-hover transition-colors">
                    Manage
                  </Link>
                </div>
              </div>
            ))}
            {client.websites.length === 0 && (
              <EmptyState 
                title="No Websites" 
                description="No websites assigned to this client." 
                icon={<Globe className="h-6 w-6 text-text-muted" />}
                className="py-12"
              />
            )}
          </div>
        </div>

        {/* Right Column: Notification Log & Config */}
        <div className="flex flex-col gap-10">

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center gap-2">
                Routing Configuration
              </span>
            </div>
            <div className="flex flex-col gap-5 p-6 border border-border bg-[#020202]">
               {client.telegramChatId && (
                 <CopyField label="Telegram Chat ID" value={client.telegramChatId} />
               )}
               {hasCustomToken ? (
                 <CopyField label="Custom Bot Token" value={client.telegramBotToken!} hidden={true} />
               ) : (
                 <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest p-3 border border-border bg-surface/10 text-center">
                   Using System Default Bot
                 </div>
               )}
            </div>
          </div>

          {/* Notification Log */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-text-muted" /> Notification Log
              </span>
            </div>
          
          <div className="flex flex-col bg-[#020202] border border-border">
            <div className="flex flex-col divide-y divide-border/30 max-h-[600px] overflow-y-auto">
              {client.notificationLogs.map((notif) => (
                <div key={notif.id} className="flex flex-col py-3 px-6 hover:bg-surface-hover/20 transition-colors">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest w-16 shrink-0">
                      {notif.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {notif.type.includes("ERROR") || notif.type.includes("DOWN") || notif.type.includes("EXPIRED") ? (
                      <span className="font-mono text-[10px] text-danger uppercase tracking-widest">[ERR]</span>
                    ) : notif.type.includes("EXPIRING") || notif.type.includes("BLOCKED") ? (
                      <span className="font-mono text-[10px] text-warning uppercase tracking-widest">[WRN]</span>
                    ) : (
                      <span className="font-mono text-[10px] text-success uppercase tracking-widest">[SYS]</span>
                    )}
                  </div>
                  <div className="pl-[76px]">
                    <div className="font-mono text-xs text-text-secondary leading-relaxed line-clamp-3 whitespace-pre-wrap [&>b]:text-text-primary [&>a]:text-brand" dangerouslySetInnerHTML={{ __html: notif.message }} />
                  </div>
                </div>
              ))}
              {client.notificationLogs.length === 0 && (
                <EmptyState 
                  title="No Notifications" 
                  description="No notifications recorded." 
                  icon={<Activity className="h-6 w-6 text-text-muted" />}
                  className="py-12"
                />
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
