import { apiClient } from "./api-client";
import type { DashboardStats } from "@/types";

export const dashboardService = {
  getStats() {
    return apiClient.get<DashboardStats>("/api/dashboard/stats");
  },
};
