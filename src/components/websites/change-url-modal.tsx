"use client";

import { useState } from "react";
import { Link as LinkIcon, Save } from "lucide-react";
import { toast } from "sonner";

export function ChangeUrlModalButton({ website, variant = "ghost" }: { website: any, variant?: "ghost" | "outline" }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(website.url);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { updateWebsiteUrl } = await import("@/app/(dashboard)/websites/actions");
      await updateWebsiteUrl(website.id, url);
      toast.success("Target URL updated successfully.");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update URL.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {variant === "outline" ? (
        <button 
          onClick={() => setOpen(true)} 
          className="font-mono text-[10px] text-text-muted hover:text-text-primary uppercase tracking-widest border border-border px-2 py-1 transition-colors flex items-center gap-1"
        >
          <LinkIcon className="h-3 w-3" /> Change URL
        </button>
      ) : (
        <button 
          onClick={() => setOpen(true)} 
          className="font-mono text-xs text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors flex items-center gap-1"
        >
          <LinkIcon className="h-3 w-3" /> URL
        </button>
      )}
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/90 backdrop-blur-sm p-4">
          <div className="bg-[#020202] border border-border w-full max-w-md flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-border flex items-center justify-between">
               <span className="font-mono text-xs uppercase tracking-widest text-text-primary">
                 Modify Target URL <span className="text-text-muted">/ {website.name}</span>
               </span>
               <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary font-mono text-xs">
                 [ CLOSE ]
               </button>
             </div>
             
             <form onSubmit={handleSave} className="flex flex-col">
               <div className="p-6">
                 <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2 block">Endpoint URL</label>
                 <input 
                   type="url"
                   required
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                   placeholder="https://acme.com" 
                   className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none"
                   autoFocus
                 />
               </div>
               
               <div className="p-4 bg-surface/20 border-t border-border flex justify-end gap-2 mt-2">
                 <button 
                   type="button" 
                   onClick={() => setOpen(false)} 
                   className="font-mono text-xs px-4 py-2 text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   disabled={isSaving} 
                   className="flex items-center gap-2 bg-text-primary text-base px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-text-secondary transition-colors disabled:opacity-50"
                 >
                   {isSaving ? "Updating..." : <><Save className="h-3 w-3" /> Update</>}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
}
