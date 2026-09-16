"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Save, Trash2, AlertCircle } from "lucide-react";
import { upsertWebsite, deleteWebsite } from "@/app/(dashboard)/websites/actions";
import { getWebsiteFormOptions } from "@/app/(dashboard)/websites/form-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WebsiteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function WebsiteSheet({ open, onOpenChange, initialData }: WebsiteSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [options, setOptions] = useState<{ clients: any[], packages: any[] }>({ clients: [], packages: [] });
  const isEditing = !!initialData;
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setIsConfirmingDelete(false);
      getWebsiteFormOptions().then(setOptions);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await upsertWebsite({
        id: initialData?.id,
        name: formData.get("name") as string,
        url: formData.get("url") as string,
        clientId: formData.get("clientId") as string,
        packageId: formData.get("packageId") as string,
        deploymentPlatform: formData.get("deploymentPlatform") as string,
        isActive: formData.get("isActive") === "on",
      });
      toast.success(initialData ? "Website updated successfully." : "Website registered successfully.");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save website.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    
    setIsLoading(true);
    try {
      await deleteWebsite(initialData.id);
      toast.success("Website permanently deleted.");
      onOpenChange(false);
      router.refresh();
      router.push("/websites");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete website.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-base border-l border-border sm:max-w-md w-full p-0 flex flex-col gap-0 rounded-none shadow-2xl shadow-black">
        <SheetHeader className="border-b border-border p-6 bg-surface/20">
          <SheetTitle className="font-light tracking-tight text-2xl text-text-primary">
            {isEditing ? "Edit Property" : "Register Property"}
          </SheetTitle>
          <SheetDescription className="font-mono text-xs text-text-muted uppercase tracking-widest mt-2">
            {isEditing ? "Modify existing monitored website" : "Add new website for monitoring"}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col divide-y divide-border/50">
            
            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Property Name <span className="text-danger">*</span></label>
              <input 
                name="name"
                required 
                defaultValue={initialData?.name}
                placeholder="Acme Store" 
                className="w-full bg-transparent border-b border-border py-2 text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Target URL <span className="text-danger">*</span></label>
              <input 
                name="url"
                required
                type="text" 
                defaultValue={initialData?.url}
                placeholder="acme.com" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Client Owner <span className="text-danger">*</span></label>
              <select 
                name="clientId"
                required
                defaultValue={initialData?.clientId || ""}
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors rounded-none appearance-none" 
              >
                <option value="" disabled className="bg-base">Select Client Entity...</option>
                {options.clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-base">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Service Tier <span className="text-danger">*</span></label>
              <select 
                name="packageId"
                required
                defaultValue={initialData?.packageId || ""}
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors rounded-none appearance-none" 
              >
                <option value="" disabled className="bg-base">Select Service Tier...</option>
                {options.packages.map(p => (
                  <option key={p.id} value={p.id} className="bg-base">{p.name} ({p.durationDays} Days)</option>
                ))}
              </select>
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Hosting Platform</label>
              <select 
                name="deploymentPlatform"
                defaultValue={initialData?.deploymentPlatform || "VERCEL"}
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors rounded-none appearance-none" 
              >
                <option value="VERCEL" className="bg-base">Vercel</option>
                <option value="NETLIFY" className="bg-base">Netlify</option>
                <option value="RAILWAY" className="bg-base">Railway</option>
                <option value="VPS" className="bg-base">VPS / Custom</option>
                <option value="CPANEL" className="bg-base">cPanel</option>
                <option value="OTHER" className="bg-base">Other</option>
              </select>
            </div>
            
            <div className="p-6 flex items-center justify-between">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Monitoring Status</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isActive"
                  defaultChecked={initialData?.isActive ?? true}
                  className="w-4 h-4 accent-text-primary bg-transparent border-border" 
                />
                <span className="font-mono text-xs text-text-primary uppercase tracking-widest">Active</span>
              </div>
            </div>

          </div>

          <SheetFooter className="border-t border-border mt-auto flex flex-row items-center justify-between p-4 bg-surface/20">
            {isEditing ? (
              <button 
                type="button" 
                onClick={handleDelete}
                disabled={isLoading}
                className={`font-mono text-xs px-4 py-2 uppercase tracking-widest transition-colors flex items-center gap-2 ${isConfirmingDelete ? 'bg-danger text-white' : 'text-danger hover:bg-danger/10'}`}
              >
                {isConfirmingDelete ? (
                  <>Confirm <AlertCircle className="h-3 w-3" /></>
                ) : (
                  <>Delete <Trash2 className="h-3 w-3" /></>
                )}
              </button>
            ) : (
              <div /> 
            )}
            
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => onOpenChange(false)} 
                className="font-mono text-xs px-4 py-2 text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="flex items-center gap-2 bg-text-primary text-base px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : <><Save className="h-3 w-3" /> Save</>}
              </button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
