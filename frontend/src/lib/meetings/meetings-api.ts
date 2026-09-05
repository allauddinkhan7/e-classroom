import { apiClient } from "@/lib/api-client";

export type MeetingJoinResponse = { meetingId: string; token: string; url: string };

export async function joinClassroomMeeting(classroomId: string): Promise<MeetingJoinResponse> {
  const res = await apiClient.post(`/classrooms/${classroomId}/meetings/join`);
  return res.data;
}

export async function endMeeting(meetingId: string) {
  const res = await apiClient.post(`/meetings/${meetingId}/end`);
  return res.data;
}