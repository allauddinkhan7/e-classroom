import { apiClient } from "@/lib/api-client";

export type ChatMessage = {
  id: string;
  content: string;
  sentAt: string;
  sender: { id: string; fullName: string };
};

export async function fetchMessageHistory(classroomId: string): Promise<ChatMessage[]> {
  const res = await apiClient.get(`/classrooms/${classroomId}/messages`);
  return res.data.reverse(); // backend returns newest-first; we want oldest-first for display
}