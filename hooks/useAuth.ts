"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services";

interface AuthState {
  isAuthenticated: boolean | null;
  professorId: string | null;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: null,
    professorId: null,
    firstName: null,
    lastName: null,
    isAdmin: false,
  });

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const data = await authService.getSession();
        if (!cancelled) {
          setAuth({
            isAuthenticated: true,
            professorId: String(data.professorId),
            firstName: data.firstName,
            lastName: data.lastName,
            isAdmin: data.isAdmin,
          });
        }
      } catch {
        if (!cancelled) {
          setAuth(prev => ({ ...prev, isAuthenticated: false }));
        }
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated === false) {
      router.push("/login");
    }
  }, [auth.isAuthenticated, router]);

  return auth;
}
