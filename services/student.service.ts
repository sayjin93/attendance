import { apiClient } from "./api-client";
import type { Student } from "@/types";

export const studentService = {
  getByClass(classId: number | null) {
    if (!classId) return Promise.resolve([]);
    return apiClient.get<Student[]>(`/api/students?classId=${classId}`);
  },

  create(data: {
    firstName: string;
    lastName: string;
    institutionEmail: string;
    classId: number;
    memo?: string | null;
    father?: string | null;
    personalEmail?: string | null;
    phone?: string | null;
    orderId?: number | null;
  }) {
    return apiClient.post<Student>("/api/students", data);
  },

  update(data: {
    id: number;
    firstName: string;
    lastName: string;
    classId: number;
    memo?: string | null;
    father?: string | null;
    personalEmail?: string | null;
    phone?: string | null;
    orderId?: number | null;
  }) {
    return apiClient.put<Student>("/api/students", data);
  },

  delete(id: number) {
    return apiClient.delete<{ message: string }>("/api/students", {
      body: { id },
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  },
};
