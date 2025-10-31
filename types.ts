export interface Professor {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  classes?: Class[];
  teachingAssignments?: TeachingAssignment[];
}

export interface Program {
  id: number;
  name: string;
  classes?: Class[];
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  programId: number;
  program?: Program;
  teachingAssignments?: TeachingAssignment[];
}

export interface Class {
  id: number;
  name: string;
  programId: number;
  program?: Program;
  students?: Student[];
  teachingAssignments?: TeachingAssignment[];
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  memo?: string | null;
  classId: number;
  class?: Class;
  attendance?: Attendance[];
}

export interface Lecture {
  id: number;
  date: string | Date;
  attendance?: Attendance[];
}

export interface Attendance {
  id: number;
  studentId: number;
  student?: Student;
  lectureId: number;
  lecture?: Lecture;
  status: AttendanceStatus;
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  PARTICIPATED = "PARTICIPATED",
}

export interface AttendanceRecord {
  id: number;
  firstName: string;
  lastName: string;
  memo?: string | null;
  status: AttendanceStatus;
}

export interface StudentReport {
  id: number;
  firstName: string;
  lastName: string;
  presence: number;
  absence: number;
  participation: number;
}

// ✅ New TeachingAssignment Type
export interface TeachingAssignment {
  id: number;
  professorId: number;
  professor?: Professor;
  subjectId: number;
  subject?: Subject;
  classId: number;
  class?: Class;
  typeId: number;
  type?: TeachingType;
}

export interface TeachingType {
  id: number;
  name: string;
}
