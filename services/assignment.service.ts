import { apiClient } from "./api-client";
import type { TeachingAssignment, Professor, Subject, Class, Program, TeachingType } from "@/types";

interface AssignmentsResponse {
  assignments: TeachingAssignment[];
  professors: Professor[];
  subjects: Subject[];
  classes: Class[];
  programs: Program[];
  teachingTypes: TeachingType[];
}

export const assignmentService = {
  getAll() {
    return apiClient.get<AssignmentsResponse>("/api/assignments");
  },

  create(data: {
    professorId: number;
    subjectId: number;
    classId: number;
    typeId: number;
  }) {
    return apiClient.post<TeachingAssignment>("/api/assignments", data);
  },

  update(
    id: number,
    data: {
      professorId: number;
      subjectId: number;
      classId: number;
      typeId: number;
    }
  ) {
    return apiClient.put<TeachingAssignment>(`/api/assignments/${id}`, data);
  },

  delete(id: number) {
    return apiClient.delete<{ message: string }>(`/api/assignments/${id}`);
  },
};
