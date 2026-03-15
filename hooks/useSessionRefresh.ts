"use client";

import { useEffect, useCallback, useRef } from "react";
import { getDeviceFingerprint, FINGERPRINT_HEADER } from "@/lib/fingerprint";

/**
 * Proactively refreshes the session (access + refresh tokens) while the user is active.
 * Runs every 10 minutes by default, ensuring the 15-minute access token never expires
 * during active use. Also rotates the refresh token for security.
 */
export function useSessionRefresh(enabled = true, refreshInterval = 10 * 60 * 1000) {
  const lastActivityRef = useRef<number>(Date.now());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const fingerprint = await getDeviceFingerprint();
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { [FINGERPRINT_HEADER]: fingerprint },
      });

      if (!response.ok) {
        console.warn("Session refresh failed — redirecting to login");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  }, []);

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    refreshTimerRef.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      const tenMinutes = 10 * 60 * 1000;

      // Only refresh if user has been active within the last 10 minutes
      if (timeSinceActivity < tenMinutes) {
        refreshSession();
      }
    }, refreshInterval);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [enabled, refreshInterval, refreshSession, updateActivity]);
}
