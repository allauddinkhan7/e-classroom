import { apiClient } from "@/lib/api-client";

export type Classroom = {
  id: string;
  name: string;
  type: "COURSE" | "STUDY_GROUP";
  createdAt: string;
  creator: { id: string; fullName: string };
  _count: { enrollments: number };
};

export async function fetchClassrooms(): Promise<Classroom[]> {
  const res = await apiClient.get("/classrooms");
  return res.data;
}

export async function createClassroom(name: string) {
  const res = await apiClient.post("/classrooms", { name });
  return res.data;
}