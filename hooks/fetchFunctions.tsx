import { AttendanceRecord, StudentReport } from "@/types";

export async function fetchClasses() {
  const res = await fetch("/api/classes");
  return res.json();
}
export async function fetchClassesByProfessor(professorId: string) {
  if (!professorId) return [];

  const res = await fetch(`/api/classes?professorId=${professorId}`);
  return res.json();
}
export async function fetchClassesWithSubjects(professorId: string) {
  const res = await fetch(`/api/lectures?professorId=${professorId}`);

  return res.json();
}

export async function fetchClassesIncludesLecturesAndStudents(
  professorId: string
) {
  if (!professorId) return [];

  const res = await fetch(
    `/api/classes?professorId=${professorId}&includeLectures=true&includeStudents=true`
  );
  return res.json();
}

export async function fetchStudents(classId: number | null) {
  if (!classId) return [];
  const res = await fetch(`/api/students?classId=${classId}`);
  return res.json();
}

export async function fetchSubjects() {
  const res = await fetch("/api/subjects");
  return res.json();
}

export async function fetchAssignments() {
  const res = await fetch("/api/assignments");
  return res.json();
}

export async function updateAssignment(id: number, professorId: number, subjectId: number, classId: number, typeId: number) {
  const res = await fetch("/api/assignments", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, professorId, subjectId, classId, typeId }),
  });
  return res.json();
}

export async function deleteAssignment(id: number) {
  const res = await fetch(`/api/assignments?id=${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function fetchAttendance(
  professorId: string,
  classId: string,
  lectureId: string
): Promise<AttendanceRecord[]> {
  if (!classId || !lectureId) return [];

  const res = await fetch(
    `/api/attendance?professorId=${professorId}&classId=${classId}&lectureId=${lectureId}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch attendance");
  }
  const data = await res.json();
  return data;
}
export async function updateAttendance(data: {
  studentId: number;
  lectureId: string;
  status: "PRESENT" | "ABSENT" | "PARTICIPATED";
}) {
  const res = await fetch("/api/attendance", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update attendance");
  }
  return res.json();
}

// New batch update function
export async function updateAttendanceBatch(attendanceList: Array<{
  studentId: number;
  lectureId: string;
  status: "PRESENT" | "ABSENT" | "PARTICIPATED";
}>) {
  const res = await fetch("/api/attendance", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attendanceList),
  });
  if (!res.ok) {
    throw new Error("Failed to update attendance batch");
  }
  return res.json();
}

// Reports functions
export async function fetchPrograms() {
  const res = await fetch("/api/reports");
  if (!res.ok) {
    throw new Error("Failed to fetch programs");
  }
  return res.json();
}

export async function fetchClassesForReports(programId: number) {
  const res = await fetch(`/api/reports?programId=${programId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch classes");
  }
  return res.json();
}

export async function fetchSubjectsForReports(programId: number, classId: number) {
  const res = await fetch(`/api/reports?programId=${programId}&classId=${classId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch subjects");
  }
  return res.json();
}

export async function fetchReports(
  programId: number,
  classId: number,
  subjectId: number
) {
  const res = await fetch(`/api/reports?programId=${programId}&classId=${classId}&subjectId=${subjectId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }
  return res.json();
}

export async function fetchReportData(
  professorId: string,
  programId?: string,
  classId?: string,
  subjectId?: string
) {
  const params = new URLSearchParams({ professorId });
  
  if (programId) params.append('programId', programId);
  if (classId) params.append('classId', classId);
  if (subjectId) params.append('subjectId', subjectId);
  
  const res = await fetch(`/api/reports?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch report data");
  }
  return res.json();
}

export async function fetchReportsOld(
  classId: string,
  professorId: string | null
): Promise<StudentReport[]> {
  if (!classId || !professorId) return [];

  const res = await fetch(
    `/api/reports?classId=${classId}&professorId=${professorId}`
  );

  if (!res.ok) {
    console.error("❌ Error fetching reports:", await res.text());
    return [];
  }

  return res.json();
}

export async function updateClass(id: number, name: string, programId: number) {
  const res = await fetch("/api/classes", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, name, programId }),
  });
  return res.json();
}

export async function deleteClass(id: number) {
  const res = await fetch("/api/classes", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function updateStudent(id: number, firstName: string, lastName: string, classId: number, memo?: string | null) {
  const res = await fetch("/api/students", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, firstName, lastName, classId, memo }),
  });
  return res.json();
}

export async function deleteStudent(id: number) {
  const res = await fetch("/api/students", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function updateSubject(id: number, code: string, name: string, programId: number) {
  const res = await fetch("/api/subjects", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, code, name, programId }),
  });
  return res.json();
}

export async function deleteSubject(id: number) {
  const res = await fetch("/api/subjects", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function fetchProfessors(search?: string) {
  let url = "/api/professors";
  if (search && search.trim()) {
    url += `?search=${encodeURIComponent(search.trim())}`;
  }
  const res = await fetch(url);
  return res.json();
}

export async function updateProfessor(id: number, firstName: string, lastName: string, email: string, username: string, password?: string) {
  const res = await fetch("/api/professors", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, firstName, lastName, email, username, password }),
  });
  return res.json();
}

export async function deleteProfessor(id: number) {
  const res = await fetch(`/api/professors?id=${id}`, {
    method: "DELETE",
  });
  return res.json();
}
