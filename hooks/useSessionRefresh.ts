"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Hook to automatically refresh the session when user is active
 * This prevents logout when the user is actively using the application
 * 
 * @param enabled - Whether to enable auto-refresh (default: true)
 * @param refreshInterval - How often to check and refresh in milliseconds (default: 5 minutes)
 */
export function useSessionRefresh(enabled = true, refreshInterval = 5 * 60 * 1000) {
  const lastActivityRef = useRef<number>(Date.now());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Session refreshed successfully");
      } else {
        console.warn("Session refresh failed");
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

    // Track user activity
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Set up periodic session refresh
    refreshTimerRef.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      const fiveMinutes = 5 * 60 * 1000;

      // Only refresh if user has been active in the last 5 minutes
      if (timeSinceActivity < fiveMinutes) {
        refreshSession();
      }
    }, refreshInterval);

    return () => {
      // Cleanup
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [enabled, refreshInterval, refreshSession, updateActivity]);
}
