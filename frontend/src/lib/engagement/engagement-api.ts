import { apiClient } from "@/lib/api-client";

export type AttendanceResults = {
  responded: { id: string; fullName: string }[];
  missing: { id: string; fullName: string }[];
};

export async function fetchAttendanceResults(id: string): Promise<AttendanceResults> {
  const res = await apiClient.get(`/attendance-checks/${id}/results`);
  return res.data;
}