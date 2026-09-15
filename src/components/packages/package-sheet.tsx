"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Save, Trash2, AlertCircle } from "lucide-react";
import { upsertPackage, deletePackage } from "@/app/(dashboard)/packages/actions";
import { useRouter } from "next/navigation";

interface PackageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function PackageSheet({ open, onOpenChange, initialData }: PackageSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isEditing = !!initialData;
  const router = useRouter();

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
      await upsertPackage({
        id: initialData?.id,
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string) || 0,
        durationDays: parseInt(formData.get("durationDays") as string) || 30,
        description: formData.get("description") as string,
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
      await deletePackage(initialData.id);
      onOpenChange(false);
      router.refresh();
      router.push("/packages");
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
            {isEditing ? "Edit Service Tier" : "Define Service Tier"}
          </SheetTitle>
          <SheetDescription className="font-mono text-xs text-text-muted uppercase tracking-widest mt-2">
            {isEditing ? "Modify existing billing package" : "Create new billing package"}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col divide-y divide-border/50">
            
            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Tier Designation <span className="text-danger">*</span></label>
              <input 
                name="name"
                required 
                defaultValue={initialData?.name}
                placeholder="Enterprise Monitor" 
                className="w-full bg-transparent border-b border-border py-2 text-lg focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Price (IDR) <span className="text-danger">*</span></label>
              <div className="flex items-center">
                <span className="font-mono text-text-muted mr-2">Rp</span>
                <input 
                  name="price"
                  required
                  type="number"
                  min="0"
                  defaultValue={initialData?.price}
                  placeholder="50000" 
                  className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
                />
              </div>
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Duration (Days) <span className="text-danger">*</span></label>
              <input 
                name="durationDays"
                required
                type="number"
                min="1"
                defaultValue={initialData?.durationDays}
                placeholder="30" 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none" 
              />
            </div>

            <div className="p-6 space-y-2">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Specification / Notes</label>
              <textarea 
                name="description"
                defaultValue={initialData?.description}
                placeholder="Includes 5 minute interval checks and Telegram alerts..." 
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted/30 rounded-none min-h-[80px]" 
              />
            </div>

            <div className="p-6 flex items-center justify-between">
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Availability Status</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
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
