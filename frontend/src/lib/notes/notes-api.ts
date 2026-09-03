import { apiClient } from "@/lib/api-client";

export type Note = { id: string; content: string; createdAt: string };

export async function fetchNotes(classroomId: string): Promise<Note[]> {
  const res = await apiClient.get(`/classrooms/${classroomId}/notes`);
  return res.data;
}

export async function createNote(classroomId: string, content: string) {
  const res = await apiClient.post(`/classrooms/${classroomId}/notes`, { content });
  return res.data as Note;
}

export async function deleteNote(id: string) {
  const res = await apiClient.delete(`/notes/${id}`);
  return res.data;
}


export async function updateNote(id: string, content: string) {
  const res = await apiClient.patch(`/notes/${id}`, { content });
  return res.data as Note;
}