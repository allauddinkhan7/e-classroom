"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMessageHistory } from "./chat-api";

export function useMessageHistory(classroomId: string) {
  return useQuery({
    queryKey: ["classrooms", classroomId, "messages"],
    queryFn: () => fetchMessageHistory(classroomId),
  });
}