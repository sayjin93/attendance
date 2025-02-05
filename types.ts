export interface Class {
  id: string;
  name: string;
}

export interface Lecture {
  id: string;
  date: string;
  class?: { name?: string };
}

export interface StudentReport {
  id: string;
  name: string;
  presence: number;
  absence: number;
  participation: number;
}
