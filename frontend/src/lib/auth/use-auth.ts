"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginRequest, registerRequest } from "./auth-api";
import { LoginFormValues, RegisterFormValues } from "@/lib/schemas/auth.schema";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginFormValues) => loginRequest(data),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Invalid email or password");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormValues) => registerRequest(data),
    onSuccess: () => {
      toast.success("Account created — please log in");
      router.push("/login");
    },
    onError: (error: any) => {
      const message =
        error?.response?.status === 409
          ? "An account with this email already exists"
          : "Something went wrong — please try again";
      toast.error(message);
    },
  });
}