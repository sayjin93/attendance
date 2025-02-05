"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  //#region constants
  const router = useRouter();
  //#endregion

  //#region states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [professorId, setProfessorId] = useState<number | null>(null);
  const [professorName, setProfessorName] = useState<string | null>(null);
  //#endregion

  //#region useEffect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setProfessorId(data.professorId); // ✅ Save professor ID
          setProfessorName(data.name); // ✅ Save professor name
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);
  //#endregion

  return { isAuthenticated, professorId, professorName }; // ✅ Return all values
}
