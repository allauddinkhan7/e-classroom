import { apiClient } from "@/lib/api-client";

export type AttendanceResults = {
  responded: { id: string; fullName: string }[];
  missing: { id: string; fullName: string }[];
};

export type PopQuestionResults = {
  question: string;
  correctAnswer: string;
  responses: { user: { id: string; fullName: string }; answer: string; isCorrect: boolean }[];
  missing: { id: string; fullName: string }[];
};

export async function fetchAttendanceResults(id: string): Promise<AttendanceResults> {
  const res = await apiClient.get(`/attendance-checks/${id}/results`);
  return res.data;
}

export async function fetchPopQuestionResults(id: string): Promise<PopQuestionResults> {
  const res = await apiClient.get(`/pop-questions/${id}/results`);
  return res.data;
}