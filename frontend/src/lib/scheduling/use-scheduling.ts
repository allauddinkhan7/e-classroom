"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchScheduledSessions, scheduleClass } from "./scheduling-api";

export function useScheduledSessions(classroomId: string) {
  return useQuery({
    queryKey: ["classrooms", classroomId, "scheduled-sessions"],
    queryFn: () => fetchScheduledSessions(classroomId),
  });
}

export function useScheduleClass(classroomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduledAt: string) => scheduleClass(classroomId, scheduledAt),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "scheduled-sessions"],
      });
      toast.success("Class scheduled. Students will get a reminder 5 minutes before.");
    },
    onError: (error: any) => {
      const message =
        error?.response?.status === 400
          ? error.response.data?.message || "Pick a time more than 5 minutes from now"
          : "Couldn't schedule the class. Please try again.";
      toast.error(message);
    },
  });
}