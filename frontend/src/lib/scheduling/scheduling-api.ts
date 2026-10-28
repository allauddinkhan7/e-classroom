import { apiClient } from "@/lib/api-client";

export type ScheduledSession = {
  id: string;
  classroomId: string;
  scheduledAt: string;
  reminderSent: boolean;
  createdAt: string;
};

export async function fetchScheduledSessions(classroomId: string): Promise<ScheduledSession[]> {
  const res = await apiClient.get(`/classrooms/${classroomId}/scheduled-sessions`);
  return res.data;
}

export async function scheduleClass(classroomId: string, scheduledAt: string) {
  const res = await apiClient.post(`/classrooms/${classroomId}/schedule`, { scheduledAt });
  return res.data as ScheduledSession;
}