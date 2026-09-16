"use client";

import { useState } from "react";
import { getRecentLogs } from "@/app/(dashboard)/actions";
import { formatDistanceToNow } from "date-fns";

export function ActivityStream({ initialLogs }: { initialLogs: any[] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialLogs.length === 10);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newLogs = await getRecentLogs(nextPage, 10);
      setLogs((prev) => [...prev, ...newLogs]);
      setPage(nextPage);
      if (newLogs.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[600px]">
      <div className="flex-1 overflow-y-auto">
        {logs.map((notif: any, i: number) => (
          <div key={notif.id} className={`flex flex-col py-3 px-6 sm:px-8 hover:bg-surface-hover/20 transition-colors ${i !== logs.length - 1 ? 'border-b border-border/30' : ''}`}>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest w-16 shrink-0">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </span>
              {notif.type.includes("ERROR") || notif.type.includes("DOWN") || notif.type.includes("EXPIRED") ? (
                <span className="font-mono text-[10px] text-danger uppercase tracking-widest">[ERR]</span>
              ) : notif.type.includes("EXPIRING") || notif.type.includes("BLOCKED") ? (
                <span className="font-mono text-[10px] text-warning uppercase tracking-widest">[WRN]</span>
              ) : (
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">[SYS]</span>
              )}
            </div>
            <div className="pl-[76px]">
              <div className="font-mono text-xs text-text-secondary leading-relaxed line-clamp-3 whitespace-pre-wrap [&>b]:text-text-primary [&>a]:text-brand" dangerouslySetInnerHTML={{ __html: notif.message }} />
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="p-8 text-center font-mono text-[10px] text-text-muted uppercase tracking-widest">
            No recent activity
          </div>
        )}
        
        {hasMore && (
          <div className="p-4 flex justify-center border-t border-border/30">
            <button 
              onClick={loadMore} 
              disabled={isLoading}
              className="font-mono text-[10px] text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 sm:px-8 sm:py-5 mt-auto border-t border-border bg-base/50 shrink-0">
        <span className="font-mono text-xs text-text-muted uppercase tracking-widest">End of Stream</span>
      </div>
    </div>
  );
}
