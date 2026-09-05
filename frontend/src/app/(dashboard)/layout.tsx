import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";
import { RequireAuth } from "@/lib/auth/require-auth";
import { ActiveCallOverlay } from "@/lib/meetings/active-call-overlay";
import { MeetingProvider } from "@/lib/meetings/meeting-context";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <MeetingProvider>
        <div className="flex min-h-screen">
          <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
            <SidebarNav className="p-2" />
          </aside>
          <div className="flex flex-1 flex-col">
            <TopBar />
            <main className="flex-1 bg-muted/30 p-4 lg:p-6">{children}</main>
          </div>
        </div>
        <ActiveCallOverlay />
      </MeetingProvider>
    </RequireAuth>
  );
}