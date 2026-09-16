"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteClient } from "@/app/(dashboard)/clients/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ClientDeleteButtonProps {
  clientId: string;
  clientName: string;
  redirectAfterDelete?: boolean;
}

export function ClientDeleteButton({ clientId, clientName, redirectAfterDelete = false }: ClientDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteClient(clientId);
      toast.success("Client permanently deleted.");
      setOpen(false);
      router.refresh();
      if (redirectAfterDelete) {
        router.push("/clients");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete client.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="font-mono text-[10px] text-danger hover:bg-danger/10 uppercase tracking-widest flex items-center gap-1 transition-colors border border-danger/30 px-3 py-1.5"
      >
        <Trash2 className="h-3 w-3" /> Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/90 backdrop-blur-sm p-4">
          <div className="bg-[#020202] border border-danger/30 w-full max-w-md flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-danger/30 flex items-center gap-3">
               <AlertTriangle className="h-5 w-5 text-danger" />
               <span className="font-mono text-sm uppercase tracking-widest text-danger">
                 Confirm Deletion
               </span>
             </div>
             
             <div className="p-6 flex flex-col gap-4">
               <p className="font-mono text-xs text-text-muted leading-relaxed">
                 Are you sure you want to delete <span className="text-text-primary font-bold">{clientName}</span>?
               </p>
               <p className="font-mono text-[10px] text-danger/80 uppercase tracking-widest bg-danger/10 p-3 border border-danger/20">
                 Warning: This action will permanently remove all associated websites, notification logs, and routing configurations.
               </p>
             </div>
             
             <div className="p-4 border-t border-danger/30 bg-surface/10 flex justify-end gap-3">
               <button 
                 onClick={() => setOpen(false)} 
                 disabled={isLoading}
                 className="font-mono text-xs px-4 py-2 text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleDelete}
                 disabled={isLoading}
                 className="flex items-center gap-2 bg-danger text-white px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-danger/80 transition-colors disabled:opacity-50"
               >
                 {isLoading ? "Deleting..." : "Permanently Delete"}
               </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
