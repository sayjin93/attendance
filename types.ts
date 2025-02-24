export interface Class {
  id: string;
  name: string;
}

export interface Lecture {
  id: string;
  date: string;
  class?: { name?: string };
}

export interface Student {
  id: string;
  firstName: string;
  lastName?: string;
  class?: { name: string };
}

export interface AttendanceRecord {
  id: string;
  firstName: string;
  lastName: string;
  status: "PRESENT" | "ABSENT" | "PARTICIPATED";
}

export interface StudentReport {
  id: string;
  firstName: string;
  lastName: string;
  presence: number;
  absence: number;
  participation: number;
}
