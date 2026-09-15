"use client";

import { useState } from "react";
import { Search, MessageCircle, Send, ArrowRight, Plus } from "lucide-react";
import { ClientSheet } from "@/components/clients/client-sheet";
import { CredentialsModalButton } from "@/components/clients/credentials-modal";
import Link from "next/link";

const MOCK_CLIENTS = [
  { id: "c_1", name: "Acme Corp", email: "hello@acme.com", whatsapp: "+6281234567890", telegram: "123456789", token: "custom", sites: 3 },
  { id: "c_2", name: "Zenith LLC", email: "contact@zenith.io", whatsapp: "+6289999999999", telegram: "987654321", token: "default", sites: 1 },
  { id: "c_3", name: "Global Inc", email: "it@global.store", whatsapp: null, telegram: "555555555", token: "default", sites: 5 },
];

export default function ClientsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const handleCreate = () => {
    setEditingClient(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">Client Roster</h1>
          <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
            Entity management & contact routing
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              placeholder="Query entities..." 
              className="w-full bg-transparent border border-border py-2 pl-9 pr-4 text-sm font-mono focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/50 rounded-none"
            />
          </div>
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-2 bg-text-primary text-base px-4 py-2 font-mono text-sm uppercase tracking-widest hover:bg-text-secondary transition-colors"
          >
            <Plus className="h-4 w-4" /> Register
          </button>
        </div>
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
          {MOCK_CLIENTS.map((client) => (
            <div key={client.id} className="grid grid-cols-1 lg:grid-cols-12 hover:bg-surface-hover/30 transition-colors group">
              
              {/* Identity */}
              <div className="col-span-1 lg:col-span-4 p-6 lg:p-4 flex flex-col justify-center lg:border-r border-border">
                <span className="text-xl font-light tracking-tight text-text-primary mb-1">{client.name}</span>
                <span className="font-mono text-xs text-text-muted">{client.email}</span>
              </div>

              {/* Routing Context */}
              <div className="col-span-1 lg:col-span-3 px-6 pb-6 lg:p-4 flex flex-col justify-center gap-2 lg:border-r border-border">
                {client.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-text-muted" />
                    <span className="font-mono text-xs text-text-secondary">{client.whatsapp}</span>
                  </div>
                )}
                {client.telegram && (
                  <div className="flex items-center gap-2">
                    <Send className="h-3.5 w-3.5 text-text-muted" />
                    <span className="font-mono text-xs text-text-secondary">{client.telegram}</span>
                  </div>
                )}
              </div>

              {/* Capacity */}
              <div className="col-span-1 lg:col-span-2 px-6 pb-6 lg:p-4 flex flex-col justify-center lg:border-r border-border">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest lg:hidden mb-1">Capacity</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light text-text-primary">{client.sites}</span>
                  <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">Sites</span>
                </div>
              </div>

              {/* Access Gateway (Actions) */}
              <div className="col-span-1 lg:col-span-3 px-6 pb-6 lg:p-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${client.token === 'custom' ? 'bg-success' : 'bg-text-muted'}`} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted whitespace-nowrap">
                    {client.token === 'custom' ? 'Custom Bot' : 'Sys Default'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                  <CredentialsModalButton client={client} />
                  <button onClick={() => handleEdit(client)} className="font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors">
                    Edit
                  </button>
                  <Link href={`/clients/${client.id}`} className="font-mono text-xs text-text-primary hover:text-brand flex items-center gap-1 uppercase tracking-widest transition-colors">
                    Inspect <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      <ClientSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} initialData={editingClient} />
    </div>
  );
}
