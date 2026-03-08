import { apiClient } from "./api-client";
import type { Professor } from "@/types";

export const professorService = {
  getAll(search?: string) {
    const url = search?.trim()
      ? `/api/professors?search=${encodeURIComponent(search.trim())}`
      : "/api/professors";
    return apiClient.get<Professor[]>(url);
  },

  getById(id: number) {
    return apiClient.get<Professor>(`/api/professors/${id}`);
  },

  create(data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
  }) {
    return apiClient.post<Professor>("/api/professors", data);
  },

  update(data: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password?: string;
  }) {
    return apiClient.put<Professor>("/api/professors", data);
  },

  delete(id: number) {
    return apiClient.delete<{ message: string }>(`/api/professors?id=${id}`);
  },
};
