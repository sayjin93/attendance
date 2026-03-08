import { apiClient } from "./api-client";
import type { LecturesResponse } from "@/types";

export const lectureService = {
  getAll() {
    return apiClient.get<LecturesResponse>("/api/lectures");
  },

  getByProfessor(professorId: string) {
    return apiClient.get<LecturesResponse>(`/api/lectures?professorId=${professorId}`);
  },

  create(data: { assignmentId: number; date: string }) {
    return apiClient.post<{ id: number }>("/api/lectures", data);
  },

  update(data: { id: number; assignmentId?: number; date?: string }) {
    return apiClient.put<{ id: number }>("/api/lectures", data);
  },

  delete(id: number) {
    return apiClient.delete<{ message: string }>(`/api/lectures?id=${id}`);
  },
};
