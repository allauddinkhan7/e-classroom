import { apiClient } from "@/lib/api-client";

export type Classroom = {
  id: string;
  name: string;
  type: "COURSE" | "STUDY_GROUP";
  createdAt: string;
  creator: { id: string; fullName: string };
  _count: { enrollments: number };
};

export type ClassroomDetail = Classroom & {
  enrollments: {
    id: string;
    roleInClass: "MEMBER" | "HOST";
    user: { id: string; fullName: string; email: string; role: string };
  }[];
};

export type AvailableStudent = { id: string; fullName: string; email: string };

export async function fetchClassrooms(): Promise<Classroom[]> {
  const res = await apiClient.get("/classrooms");
  return res.data;
}

export async function createClassroom(name: string) {
  const res = await apiClient.post("/classrooms", { name });
  return res.data;
}

export async function fetchClassroom(id: string): Promise<ClassroomDetail> {
  const res = await apiClient.get(`/classrooms/${id}`);
  return res.data;
}

export async function fetchAvailableStudents(
  id: string,
  search?: string,
): Promise<AvailableStudent[]> {
  const res = await apiClient.get(`/classrooms/${id}/available-students`, {
    params: search ? { search } : undefined,
  });
  return res.data;
}

export async function addMembersBulk(id: string, userIds: string[]) {
  const res = await apiClient.post(`/classrooms/${id}/members/bulk`, {
    userIds,
  });
  return res.data as { added: number };
}

export async function updateClassroom(id: string, name: string) {
  const res = await apiClient.patch(`/classrooms/${id}`, { name });
  return res.data as Classroom;
}
