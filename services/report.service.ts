import { apiClient } from "./api-client";
import type { ReportData, StudentReport, Program, Class, Subject } from "@/types";

export const reportService = {
  getPrograms() {
    return apiClient.get<Program[]>("/api/reports");
  },

  getClassesByProgram(programId: number) {
    return apiClient.get<Class[]>(`/api/reports?programId=${programId}`);
  },

  getSubjectsByProgramAndClass(programId: number, classId: number) {
    return apiClient.get<Subject[]>(
      `/api/reports?programId=${programId}&classId=${classId}`
    );
  },

  getReports(programId: number, classId: number, subjectId: number) {
    return apiClient.get<ReportData>(
      `/api/reports?programId=${programId}&classId=${classId}&subjectId=${subjectId}`
    );
  },

  getReportData(params: {
    professorId: string;
    programId?: string;
    classId?: string;
    subjectId?: string;
  }) {
    const searchParams = new URLSearchParams({ professorId: params.professorId });
    if (params.programId) searchParams.append("programId", params.programId);
    if (params.classId) searchParams.append("classId", params.classId);
    if (params.subjectId) searchParams.append("subjectId", params.subjectId);
    return apiClient.get<ReportData>(`/api/reports?${searchParams.toString()}`);
  },

  /** @deprecated Use getReports instead */
  getReportsLegacy(classId: string, professorId: string | null): Promise<StudentReport[]> {
    if (!classId || !professorId) return Promise.resolve([]);
    return apiClient.get<StudentReport[]>(
      `/api/reports?classId=${classId}&professorId=${professorId}`
    );
  },
};
