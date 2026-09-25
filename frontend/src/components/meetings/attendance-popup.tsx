"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveCall } from "./meeting-context";

export function AttendancePopup() {
  const { pendingAttendanceCheckId, respondToAttendance } = useActiveCall();

  if (!pendingAttendanceCheckId) return null;

  return (
    <div className="fixed left-1/2 top-6 z-[60] w-full max-w-sm -translate-x-1/2 rounded-lg border bg-background p-4 shadow-xl">
      <p className="text-sm font-medium">Attendance check!</p>
      <p className="text-sm text-muted-foreground">Confirm you&apos;re still here.</p>
      <Button className="mt-3 w-full" onClick={respondToAttendance}>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        I&apos;m here
      </Button>
    </div>
  );
}