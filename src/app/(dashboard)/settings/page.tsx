"use client";

import { Save, BellRing, Settings2, ShieldAlert, Cpu } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col animate-in fade-in duration-500 max-w-7xl">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-text-primary">System Configuration</h1>
          <p className="text-sm font-mono text-text-muted mt-2 uppercase tracking-widest">
            Core routing & telemetry engine settings
          </p>
        </div>
      </header>

      <div className="flex flex-col border border-border bg-[#020202]">
        
        {/* Section 1: Telegram Gateway */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-border">
          <div className="md:col-span-4 p-8 border-b md:border-b-0 md:border-r border-border bg-surface/10 flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="h-4 w-4 text-text-muted" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">Telegram Gateway</h2>
            </div>
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest leading-relaxed">
              Default transmission bot for client notifications. Used when a client does not possess a custom bot token.
            </p>
          </div>
          <div className="md:col-span-8 p-8 flex flex-col gap-6 bg-base">
            <div className="flex flex-col gap-2 max-w-2xl">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">System Default Bot Token</label>
              <input 
                type="password" 
                placeholder="bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>
            <div className="flex justify-end mt-4">
              <button className="flex items-center gap-2 bg-text-primary text-base px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors">
                <Save className="h-3 w-3" /> Commit Changes
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Telemetry Root */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-border">
          <div className="md:col-span-4 p-8 border-b md:border-b-0 md:border-r border-border bg-surface/10 flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4 text-text-muted" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">Admin Telemetry</h2>
            </div>
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest leading-relaxed">
              Target for global system alerts (e.g. fatal monitoring errors, overarching billing expirations).
            </p>
          </div>
          <div className="md:col-span-8 p-8 flex flex-col gap-6 bg-base">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Admin Bot Token</label>
                <input 
                  type="password" 
                  placeholder="bot..." 
                  className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Admin Chat ID</label>
                <input 
                  placeholder="123456789" 
                  className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
              <button className="flex items-center gap-2 font-mono text-xs text-text-primary hover:text-brand uppercase tracking-widest transition-colors border border-border px-4 py-2 hover:bg-surface-hover">
                <BellRing className="h-3 w-3" /> Test Ping
              </button>
              <button className="flex items-center gap-2 bg-text-primary text-base px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors">
                <Save className="h-3 w-3" /> Commit Changes
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Polling Engine */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 p-8 border-b md:border-b-0 md:border-r border-border bg-surface/10 flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4 text-text-muted" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-text-primary">Polling Engine</h2>
            </div>
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest leading-relaxed">
              Global limits and thresholds for the uptime checking engine and cron execution.
            </p>
          </div>
          <div className="md:col-span-8 p-8 flex flex-col gap-6 bg-base">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Global Interval (Mins)</label>
                <select 
                  defaultValue="30"
                  className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors rounded-none appearance-none"
                >
                  <option value="5" className="bg-base">5 Minutes (Heavy load)</option>
                  <option value="15" className="bg-base">15 Minutes</option>
                  <option value="30" className="bg-base">30 Minutes (Standard)</option>
                  <option value="60" className="bg-base">60 Minutes</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Expiration Warning (Days)</label>
                <input 
                  type="number" 
                  defaultValue="3" 
                  min="1" 
                  max="30" 
                  className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button className="flex items-center gap-2 bg-text-primary text-base px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors">
                <Save className="h-3 w-3" /> Commit Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
