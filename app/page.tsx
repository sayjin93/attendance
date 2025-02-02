"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login"); // 🚀 Redirect to login if not authenticated
    } else {
      router.push("/dashboard"); // 🚀 Redirect to dashboard if authenticated
    }
  }, [isAuthenticated, router]); // ✅ Runs when `isAuthenticated` or `router` changes

  return null; // ✅ Prevents rendering unnecessary content
}
