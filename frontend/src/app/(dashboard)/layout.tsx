import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";
import { RequireAuth } from "@/lib/auth/require-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen">
        {/* Fixed sidebar — desktop only */}
        <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
          <SidebarNav className="p-2" />
        </aside>

        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 bg-muted/30 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}