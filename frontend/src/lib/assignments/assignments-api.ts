import { apiClient } from "@/lib/api-client";

export type Assignment = {
  id: string;
  classroomId: string;
  title: string;
  description: string | null;
  totalMarks: number;
  dueAt: string;
  createdAt: string;
  file: { id: string; originalName: string; mimeType: string } | null;
  submissions: { id: string; obtainedMarks: number | null; submittedAt: string }[];
};

export type Submission = {
  id: string;
  obtainedMarks: number | null;
  submittedAt: string;
  file: { id: string; originalName: string } | null;
  user: { id: string; fullName: string; email: string };
};

export async function fetchAssignments(classroomId: string): Promise<Assignment[]> {
  const res = await apiClient.get(`/classrooms/${classroomId}/assignments`);
  return res.data;
}

export async function fetchAssignment(assignmentId: string): Promise<Assignment> {
  const res = await apiClient.get(`/assignments/${assignmentId}`);
  return res.data;
}


export async function createAssignment(
  classroomId: string,
  data: { title: string; description?: string; totalMarks: number; dueAt: string },
) {
  const res = await apiClient.post(`/classrooms/${classroomId}/assignments`, data);
  return res.data as Assignment;
}

export async function submitAssignment(assignmentId: string, fileId?: string) {
  const res = await apiClient.post(`/assignments/${assignmentId}/submit`, { fileId });
  return res.data;
}


export async function updateAssignment(
  assignmentId: string,
  data: { title?: string; description?: string; totalMarks?: number; dueAt?: string; fileId?: string },
) {
  const res = await apiClient.patch(`/assignments/${assignmentId}`, data);
  return res.data as Assignment;
}

export async function fetchSubmissions(assignmentId: string): Promise<Submission[]> {
  const res = await apiClient.get(`/assignments/${assignmentId}/submissions`);
  return res.data;
}

export async function gradeSubmission(submissionId: string, obtainedMarks: number) {
  const res = await apiClient.post(`/submissions/${submissionId}/grade`, { obtainedMarks });
  return res.data;
}

export async function getFileDownloadUrl(fileId: string): Promise<{ url: string; originalName: string }> {
  const res = await apiClient.get(`/files/${fileId}/download`);
  return res.data;
}