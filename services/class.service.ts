import { apiClient } from "./api-client";
import type { Class } from "@/types";

export const classService = {
  getAll() {
    return apiClient.get<Class[]>("/api/classes");
  },

  getByProfessor(professorId: string) {
    if (!professorId) return Promise.resolve([]);
    return apiClient.get<Class[]>(`/api/classes?professorId=${professorId}`);
  },

  getWithLecturesAndStudents(professorId: string) {
    if (!professorId) return Promise.resolve([]);
    return apiClient.get<Class[]>(
      `/api/classes?professorId=${professorId}&includeLectures=true&includeStudents=true`
    );
  },

  create(data: { name: string; programId: number }) {
    return apiClient.post<Class>("/api/classes", data);
  },

  update(data: { id: number; name: string; programId: number }) {
    return apiClient.put<Class>("/api/classes", data);
  },

  delete(id: number) {
    return apiClient.delete<{ message: string }>("/api/classes", {
      body: { id },
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  },
};
