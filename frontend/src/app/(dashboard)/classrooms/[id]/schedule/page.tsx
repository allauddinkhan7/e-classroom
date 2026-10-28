"use client";

import { useParams } from "next/navigation";
import { AlertCircle, CalendarClock, CalendarX, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useClassroom } from "@/lib/classrooms/use-classrooms";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useScheduledSessions } from "@/lib/scheduling/use-scheduling";
import { ScheduleClassDialog } from "@/components/scheduling/schedule-class-dialog";

export default function SchedulePage() {
  const params = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  const { data: classroom } = useClassroom(params.id);
  const { data: sessions, isLoading, isError } = useScheduledSessions(params.id);

  // Matches the backend rule: only the classroom's creator can schedule.
  const canSchedule = classroom?.creator.id === user?.userId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Class schedule</h1>
          <p className="text-sm text-muted-foreground">
            Upcoming sessions. Students get an email reminder 5 minutes before each one.
          </p>
        </div>
        {canSchedule && <ScheduleClassDialog classroomId={params.id} />}
      </div>

      {isLoading && (
        <div className="flex min-h-[160px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Couldn&apos;t load the schedule.</p>
        </div>
      )}

      {!isLoading && !isError && sessions?.length === 0 && (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
          <CalendarX className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No upcoming classes</p>
          {canSchedule && (
            <p className="text-sm text-muted-foreground">Schedule one with the button above.</p>
          )}
        </div>
      )}

      {!isLoading && !isError && sessions && sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {new Date(s.scheduledAt).toLocaleString([], {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {s.reminderSent && <Badge variant="secondary">Reminder sent</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}