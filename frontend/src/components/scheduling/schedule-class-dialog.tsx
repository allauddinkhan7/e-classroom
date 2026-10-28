"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useScheduleClass } from "@/lib/scheduling/use-scheduling";

export function ScheduleClassDialog({ classroomId }: { classroomId: string }) {
  const [open, setOpen] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const scheduleClass = useScheduleClass(classroomId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dateTime) return;

    // datetime-local has no timezone. new Date() reads it as the user's local time,
    // and toISOString() converts it to UTC for the backend.
    scheduleClass.mutate(new Date(dateTime).toISOString(), {
      onSuccess: () => {
        setOpen(false);
        setDateTime("");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Schedule Class
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule a class</DialogTitle>
            <DialogDescription>
              Every student in this classroom gets an email 5 minutes before it starts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="scheduled-at">Date and time</Label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!dateTime || scheduleClass.isPending}>
              {scheduleClass.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {scheduleClass.isPending ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}