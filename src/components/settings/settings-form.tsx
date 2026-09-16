"use client";

import { Save, BellRing, Settings2, ShieldAlert, Cpu } from "lucide-react";
import { upsertSettings } from "@/app/(dashboard)/settings/actions";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      await upsertSettings({
        defaultTelegramBotToken: formData.get("defaultTelegramBotToken") as string,
        adminTelegramBotToken: formData.get("adminTelegramBotToken") as string,
        adminTelegramChatId: formData.get("adminTelegramChatId") as string,
        checkIntervalMinutes: parseInt(formData.get("checkIntervalMinutes") as string) || 30,
        packageExpiringThresholdDays: parseInt(formData.get("packageExpiringThresholdDays") as string) || 3,
      });
      
      toast.success("Settings saved successfully.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPing = async () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const botToken = formData.get("adminTelegramBotToken") as string;
    const chatId = formData.get("adminTelegramChatId") as string;

    if (!botToken || !chatId) {
      toast.error("Please provide both Admin Bot Token and Chat ID before testing.");
      return;
    }

    setIsPinging(true);
    try {
      const { testTelegramPing } = await import("@/app/(dashboard)/settings/actions");
      await testTelegramPing(botToken, chatId);
      toast.success("Test ping successfully sent to your Telegram!");
    } catch (err: any) {
      toast.error("Failed to send test ping: " + err.message);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col border border-border bg-[#020202]">
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
              name="defaultTelegramBotToken"
              type="password" 
              defaultValue={initialData?.defaultTelegramBotToken || ""}
              placeholder="bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" 
              className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
            />
          </div>
          <div className="flex justify-end mt-4">
            <button disabled={isLoading} className="flex items-center gap-2 bg-text-primary text-base px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors disabled:opacity-50">
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
                name="adminTelegramBotToken"
                type="password" 
                defaultValue={initialData?.adminTelegramBotToken || ""}
                placeholder="bot..." 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Admin Chat ID</label>
              <input 
                name="adminTelegramChatId"
                defaultValue={initialData?.adminTelegramChatId || ""}
                placeholder="123456789" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
            <button 
              type="button" 
              onClick={handleTestPing}
              disabled={isPinging || isLoading}
              className="flex items-center gap-2 font-mono text-xs text-text-primary hover:text-brand uppercase tracking-widest transition-colors border border-border px-4 py-2 hover:bg-surface-hover disabled:opacity-50"
            >
              <BellRing className={`h-3 w-3 ${isPinging ? 'animate-bounce' : ''}`} /> 
              {isPinging ? "Pinging..." : "Test Ping"}
            </button>
            <button disabled={isLoading} className="flex items-center gap-2 bg-text-primary text-base px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors disabled:opacity-50">
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
                name="checkIntervalMinutes"
                defaultValue={initialData?.checkIntervalMinutes?.toString() || "30"}
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
                name="packageExpiringThresholdDays"
                type="number" 
                defaultValue={initialData?.packageExpiringThresholdDays?.toString() || "3"}
                min="1" 
                max="30" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button disabled={isLoading} className="flex items-center gap-2 bg-text-primary text-base px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors disabled:opacity-50">
              <Save className="h-3 w-3" /> Commit Changes
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
