"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { joinClassroomMeeting, endMeeting } from "./meetings-api";

export function useJoinMeeting() {
  return useMutation({
    mutationFn: (classroomId: string) => joinClassroomMeeting(classroomId),
    onError: () => toast.error("Couldn't join the class — please try again"),
  });
}

export function useEndMeeting() {
  return useMutation({
    mutationFn: (meetingId: string) => endMeeting(meetingId),
    onError: () => toast.error("Couldn't end the meeting — please try again"),
  });
}