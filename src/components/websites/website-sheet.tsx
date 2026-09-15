"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Save, Trash2, AlertCircle } from "lucide-react";

interface WebsiteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function WebsiteSheet({ open, onOpenChange, initialData }: WebsiteSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isEditing = !!initialData;

  useEffect(() => {
    if (open) {
      setIsConfirmingDelete(false);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
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
                required 
                defaultValue={initialData?.name}
                placeholder="Acme Store" 
                className="w-full bg-transparent border-b border-border py-2 text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Target URL <span className="text-danger">*</span></label>
              <input 
                required
                type="url" 
                defaultValue={initialData?.url}
                placeholder="https://acme.com" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Hosting Platform</label>
              <select 
                defaultValue={initialData?.platform || "VERCEL"}
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors rounded-none appearance-none" 
              >
                <option value="VERCEL" className="bg-base">Vercel</option>
                <option value="NETLIFY" className="bg-base">Netlify</option>
                <option value="AWS" className="bg-base">AWS</option>
                <option value="VPS" className="bg-base">VPS / Custom</option>
                <option value="SHOPIFY" className="bg-base">Shopify</option>
              </select>
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Client Owner <span className="text-danger">*</span></label>
              <select 
                required
                defaultValue={initialData?.clientId || ""}
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors rounded-none appearance-none" 
              >
                <option value="" disabled className="bg-base">Select Client Entity...</option>
                <option value="c_1" className="bg-base">Acme Corp</option>
                <option value="c_2" className="bg-base">Zenith LLC</option>
                <option value="c_3" className="bg-base">Global Inc</option>
              </select>
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
