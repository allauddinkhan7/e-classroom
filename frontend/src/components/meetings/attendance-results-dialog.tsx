"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchAttendanceResults } from "@/lib/engagement/engagement-api";
import { useActiveCall } from "./meeting-context";

export function AttendanceResultsDialog() {
  const { lastAttendanceCheckId } = useActiveCall();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["attendance-results", lastAttendanceCheckId],
    queryFn: () => fetchAttendanceResults(lastAttendanceCheckId!),
    enabled: !!lastAttendanceCheckId,
  });

  if (!lastAttendanceCheckId) return null;

  return (
    <Dialog onOpenChange={(open) => open && refetch()}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-black rounded-full" />}>
        View Results
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attendance results</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-emerald-600">Responded</p>
              {data?.responded.map((u) => (
                <p key={u.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {u.fullName}
                </p>
              ))}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-destructive">Missing</p>
              {data?.missing.map((u) => (
                <p key={u.id} className="flex items-center gap-2 text-sm">
                  <XCircle className="h-3.5 w-3.5 text-destructive" /> {u.fullName}
                </p>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}