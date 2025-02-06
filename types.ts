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
  name: string;
  email?: string;
  class?: { name: string };
}

export interface AttendanceRecord {
  id: string;
  name: string; // Name i studentit është direkt në objekt
  status: "PRESENT" | "ABSENT" | "PARTICIPATED";
}

export interface StudentReport {
  id: string;
  name: string;
  presence: number;
  absence: number;
  participation: number;
}
