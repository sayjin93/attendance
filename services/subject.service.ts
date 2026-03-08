import { apiClient } from "./api-client";
import type { Subject, Program } from "@/types";

export const subjectService = {
  getAll() {
    return apiClient.get<{ subjects: Subject[]; programs: Program[] }>("/api/subjects");
  },

  create(data: { code?: string; name: string; programId: number }) {
    return apiClient.post<Subject>("/api/subjects", data);
  },

  update(data: { id: number; code: string; name: string; programId: number }) {
    return apiClient.put<Subject>("/api/subjects", data);
  },

  delete(id: number) {
    return apiClient.delete<{ message: string }>("/api/subjects", {
      body: { id },
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  },
};
