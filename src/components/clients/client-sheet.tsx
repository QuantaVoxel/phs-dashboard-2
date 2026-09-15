"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Save, Trash2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { upsertClient, deleteClient } from "@/app/(dashboard)/clients/actions";
import { useRouter } from "next/navigation";

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function ClientSheet({ open, onOpenChange, initialData }: ClientSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isEditing = !!initialData;
  const router = useRouter();

  // Reset states when opening/closing or changing initialData
  useEffect(() => {
    if (open) {
      setIsConfirmingDelete(false);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await upsertClient({
        id: initialData?.id,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        whatsappNumber: formData.get("whatsappNumber") as string,
        telegramChatId: formData.get("telegramChatId") as string,
        telegramBotToken: formData.get("telegramBotToken") as string,
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
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
      await deleteClient(initialData.id);
      onOpenChange(false);
      router.refresh();
      router.push("/clients");
    } catch (err) {
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
            {isEditing ? "Edit Entity" : "Register Entity"}
          </SheetTitle>
          <SheetDescription className="font-mono text-xs text-text-muted uppercase tracking-widest mt-2">
            {isEditing ? "Modify existing client record" : "Create new routing profile"}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col divide-y divide-border/50">
            
            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Client Name <span className="text-danger">*</span></label>
              <input 
                name="name"
                required 
                defaultValue={initialData?.name}
                placeholder="Acme Corp" 
                className="w-full bg-transparent border-b border-border py-2 text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Email Address</label>
              <input 
                name="email"
                type="email" 
                defaultValue={initialData?.email}
                placeholder="billing@acme.com" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">WhatsApp Number</label>
              <input 
                name="whatsappNumber"
                type="tel"
                defaultValue={initialData?.whatsappNumber}
                placeholder="+6281234567890" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Telegram Chat ID</label>
              <input 
                name="telegramChatId"
                defaultValue={initialData?.telegramChatId}
                placeholder="-10012345678" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest flex items-center justify-between">
                Custom Bot Token
                <span className="text-[9px] text-text-muted/70">Optional</span>
              </label>
              <input 
                name="telegramBotToken"
                defaultValue={initialData?.telegramBotToken}
                placeholder="bot12345:ABCDEF..." 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
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
              <div /> // placeholder to keep Save on the right
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
