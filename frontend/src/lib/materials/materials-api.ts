import { apiClient } from "@/lib/api-client";

export type Material = {
  id: string;
  title: string;
  postedAt: string;
  file: { id: string; originalName: string; mimeType: string } | null;
};

export async function fetchMaterials(classroomId: string): Promise<Material[]> {
  const res = await apiClient.get(`/classrooms/${classroomId}/materials`);
  return res.data;
}

export async function createMaterial(classroomId: string, title: string, fileId?: string) {
  const res = await apiClient.post(`/classrooms/${classroomId}/materials`, { title, fileId });
  return res.data as Material;
}

export async function deleteMaterial(id: string) {
  const res = await apiClient.delete(`/materials/${id}`);
  return res.data;
}