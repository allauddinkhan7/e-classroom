import { apiClient } from "@/lib/api-client";
import { LoginFormValues, RegisterFormValues } from "@/lib/schemas/auth.schema";

export async function loginRequest(data: LoginFormValues) {
  const res = await apiClient.post("/auth/login", data);
  return res.data as { accessToken: string; refreshToken: string };
}

export async function registerRequest(data: RegisterFormValues) {
  const res = await apiClient.post("/auth/register", data);
  return res.data;
}