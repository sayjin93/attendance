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
  console.log("Fetched attendance data:", data); // Debugging log
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

export async function fetchReports(
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
