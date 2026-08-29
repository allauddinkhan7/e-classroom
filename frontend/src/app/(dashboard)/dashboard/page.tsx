"use client";

import { useCurrentUser } from "@/lib/auth/use-current-user";

export default function DashboardPage() {
  const { user } = useCurrentUser();

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome{user?.email ? `, ${user.email}` : ""}
      </h1>
      <p className="text-sm text-muted-foreground">
        You&apos;re logged in as {user?.role?.toLowerCase()}. Your classrooms will appear here.
      </p>
    </div>
  );
}