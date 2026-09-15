import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-base">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-6 md:p-10 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
