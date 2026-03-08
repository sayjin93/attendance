import { apiClient } from "./api-client";
import type { AttendanceRecord } from "@/types";

interface AttendanceUpdate {
  studentId: number;
  lectureId: string;
  statusId: number;
}

export const attendanceService = {
  getByLecture(params: {
    professorId: string;
    classId: string;
    lectureId: string;
  }) {
    const { professorId, classId, lectureId } = params;
    if (!classId || !lectureId) return Promise.resolve([]);
    return apiClient.get<AttendanceRecord[]>(
      `/api/attendance?professorId=${professorId}&classId=${classId}&lectureId=${lectureId}`
    );
  },

  update(data: AttendanceUpdate) {
    return apiClient.put<AttendanceRecord>("/api/attendance", data);
  },

  updateBatch(attendanceList: AttendanceUpdate[]) {
    return apiClient.put<{ message: string }>("/api/attendance", attendanceList);
  },
};
