"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type CurrentUser = {
  fullName: string;
  userId: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode<{ fullName: string; sub: string; email: string; role: string }>(token);
      setUser({ fullName: decoded.fullName, userId: decoded.sub, email: decoded.email, role: decoded.role as CurrentUser["role"] });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading };
}