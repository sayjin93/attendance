import { PrismaClient } from "@prisma/client";

export interface LectureBackup {
  teachingAssignmentId: number;
  date: string; // ISO 8601 format
}

export const lecturesBackupData: LectureBackup[] = [
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-06
  { teachingAssignmentId: 1, date: "2025-10-06" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-06
  { teachingAssignmentId: 2, date: "2025-10-06" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-06
  { teachingAssignmentId: 3, date: "2025-10-06" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-13
  { teachingAssignmentId: 1, date: "2025-10-13" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-13
  { teachingAssignmentId: 2, date: "2025-10-13" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-13
  { teachingAssignmentId: 3, date: "2025-10-13" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-20
  { teachingAssignmentId: 1, date: "2025-10-20" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-20
  { teachingAssignmentId: 2, date: "2025-10-20" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-20
  { teachingAssignmentId: 3, date: "2025-10-20" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-25
  { teachingAssignmentId: 4, date: "2025-10-25" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-25
  { teachingAssignmentId: 5, date: "2025-10-25" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-25
  { teachingAssignmentId: 6, date: "2025-10-25" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-25
  { teachingAssignmentId: 7, date: "2025-10-25" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-25
  { teachingAssignmentId: 8, date: "2025-10-25" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-25
  { teachingAssignmentId: 9, date: "2025-10-25" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-27
  { teachingAssignmentId: 1, date: "2025-10-27" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-27
  { teachingAssignmentId: 2, date: "2025-10-27" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-10-27
  { teachingAssignmentId: 3, date: "2025-10-27" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-01
  { teachingAssignmentId: 4, date: "2025-11-01" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-01
  { teachingAssignmentId: 5, date: "2025-11-01" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-01
  { teachingAssignmentId: 6, date: "2025-11-01" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-01
  { teachingAssignmentId: 7, date: "2025-11-01" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-01
  { teachingAssignmentId: 8, date: "2025-11-01" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-01
  { teachingAssignmentId: 9, date: "2025-11-01" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-03
  { teachingAssignmentId: 1, date: "2025-11-03" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-03
  { teachingAssignmentId: 2, date: "2025-11-03" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-03
  { teachingAssignmentId: 3, date: "2025-11-03" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-08
  { teachingAssignmentId: 4, date: "2025-11-08" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-08
  { teachingAssignmentId: 5, date: "2025-11-08" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-08
  { teachingAssignmentId: 6, date: "2025-11-08" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-08
  { teachingAssignmentId: 7, date: "2025-11-08" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-08
  { teachingAssignmentId: 8, date: "2025-11-08" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-08
  { teachingAssignmentId: 9, date: "2025-11-08" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-10
  { teachingAssignmentId: 1, date: "2025-11-10" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-10
  { teachingAssignmentId: 2, date: "2025-11-10" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-10
  { teachingAssignmentId: 3, date: "2025-11-10" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-15
  { teachingAssignmentId: 4, date: "2025-11-15" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-15
  { teachingAssignmentId: 6, date: "2025-11-15" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-15
  { teachingAssignmentId: 5, date: "2025-11-15" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-15
  { teachingAssignmentId: 7, date: "2025-11-15" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-15
  { teachingAssignmentId: 8, date: "2025-11-15" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-15
  { teachingAssignmentId: 9, date: "2025-11-15" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-17
  { teachingAssignmentId: 1, date: "2025-11-17" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-17
  { teachingAssignmentId: 2, date: "2025-11-17" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-17
  { teachingAssignmentId: 3, date: "2025-11-17" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-22
  { teachingAssignmentId: 4, date: "2025-11-22" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-22
  { teachingAssignmentId: 6, date: "2025-11-22" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-22
  { teachingAssignmentId: 5, date: "2025-11-22" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-22
  { teachingAssignmentId: 7, date: "2025-11-22" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-22
  { teachingAssignmentId: 8, date: "2025-11-22" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-11-22
  { teachingAssignmentId: 9, date: "2025-11-22" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-06
  { teachingAssignmentId: 4, date: "2025-12-06" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-06
  { teachingAssignmentId: 6, date: "2025-12-06" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-06
  { teachingAssignmentId: 8, date: "2025-12-06" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-06
  { teachingAssignmentId: 5, date: "2025-12-06" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-06
  { teachingAssignmentId: 7, date: "2025-12-06" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-06
  { teachingAssignmentId: 9, date: "2025-12-06" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-13
  { teachingAssignmentId: 4, date: "2025-12-13" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-13
  { teachingAssignmentId: 5, date: "2025-12-13" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-13
  { teachingAssignmentId: 6, date: "2025-12-13" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-13
  { teachingAssignmentId: 7, date: "2025-12-13" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-13
  { teachingAssignmentId: 8, date: "2025-12-13" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-13
  { teachingAssignmentId: 9, date: "2025-12-13" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-15
  { teachingAssignmentId: 1, date: "2025-12-15" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-15
  { teachingAssignmentId: 2, date: "2025-12-15" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2025-12-15
  { teachingAssignmentId: 3, date: "2025-12-15" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-05
  { teachingAssignmentId: 2, date: "2026-01-05" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-05
  { teachingAssignmentId: 1, date: "2026-01-05" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-05
  { teachingAssignmentId: 3, date: "2026-01-05" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-10
  { teachingAssignmentId: 4, date: "2026-01-10" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-10
  { teachingAssignmentId: 5, date: "2026-01-10" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-10
  { teachingAssignmentId: 6, date: "2026-01-10" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-10
  { teachingAssignmentId: 7, date: "2026-01-10" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-10
  { teachingAssignmentId: 8, date: "2026-01-10" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-10
  { teachingAssignmentId: 9, date: "2026-01-10" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-12
  { teachingAssignmentId: 2, date: "2026-01-12" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-12
  { teachingAssignmentId: 1, date: "2026-01-12" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-12
  { teachingAssignmentId: 3, date: "2026-01-12" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-17
  { teachingAssignmentId: 4, date: "2026-01-17" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-17
  { teachingAssignmentId: 5, date: "2026-01-17" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-17
  { teachingAssignmentId: 6, date: "2026-01-17" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-17
  { teachingAssignmentId: 7, date: "2026-01-17" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-17
  { teachingAssignmentId: 8, date: "2026-01-17" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-17
  { teachingAssignmentId: 9, date: "2026-01-17" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-19
  { teachingAssignmentId: 2, date: "2026-01-19" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-19
  { teachingAssignmentId: 1, date: "2026-01-19" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-19
  { teachingAssignmentId: 3, date: "2026-01-19" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-24
  { teachingAssignmentId: 4, date: "2026-01-24" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-24
  { teachingAssignmentId: 5, date: "2026-01-24" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-24
  { teachingAssignmentId: 6, date: "2026-01-24" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-24
  { teachingAssignmentId: 7, date: "2026-01-24" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-24
  { teachingAssignmentId: 8, date: "2026-01-24" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-24
  { teachingAssignmentId: 9, date: "2026-01-24" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-26
  { teachingAssignmentId: 1, date: "2026-01-26" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-26
  { teachingAssignmentId: 2, date: "2026-01-26" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-26
  { teachingAssignmentId: 3, date: "2026-01-26" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-31
  { teachingAssignmentId: 4, date: "2026-01-31" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-31
  { teachingAssignmentId: 5, date: "2026-01-31" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-31
  { teachingAssignmentId: 6, date: "2026-01-31" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-31
  { teachingAssignmentId: 7, date: "2026-01-31" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-31
  { teachingAssignmentId: 8, date: "2026-01-31" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-01-31
  { teachingAssignmentId: 9, date: "2026-01-31" },
  // Subject: Teori e bazave të të dhënave | Class: INF205 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-02
  { teachingAssignmentId: 1, date: "2026-02-02" },
  // Subject: Teori e bazave të të dhënave | Class: INF206 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-02
  { teachingAssignmentId: 2, date: "2026-02-02" },
  // Subject: Teori e bazave të të dhënave | Class: Infoek202 (Bachelor) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-02
  { teachingAssignmentId: 3, date: "2026-02-02" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-07
  { teachingAssignmentId: 4, date: "2026-02-07" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-07
  { teachingAssignmentId: 5, date: "2026-02-07" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-07
  { teachingAssignmentId: 6, date: "2026-02-07" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-07
  { teachingAssignmentId: 7, date: "2026-02-07" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-07
  { teachingAssignmentId: 8, date: "2026-02-07" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-07
  { teachingAssignmentId: 9, date: "2026-02-07" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1IE (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-14
  { teachingAssignmentId: 4, date: "2026-02-14" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFA (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-14
  { teachingAssignmentId: 5, date: "2026-02-14" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1INFB (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-14
  { teachingAssignmentId: 6, date: "2026-02-14" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH1TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-14
  { teachingAssignmentId: 7, date: "2026-02-14" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2INF (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-14
  { teachingAssignmentId: 8, date: "2026-02-14" },
  // Subject: Projektim dhe analizë e bazave të të dhënave | Class: MSH2TI (Master) | Type: Seminar | Professor: Jurgen Kruja | Date: 2026-02-14
  { teachingAssignmentId: 9, date: "2026-02-14" },
];

export async function seedLectures(prisma: PrismaClient) {
  console.log("📚 Seeding lectures...");

  let created = 0;
  let updated = 0;

  for (const lecture of lecturesBackupData) {
    const existing = await prisma.lecture.findUnique({
      where: {
        teachingAssignmentId_date: {
          teachingAssignmentId: lecture.teachingAssignmentId,
          date: new Date(lecture.date),
        },
      },
    });

    if (existing) {
      updated++;
    } else {
      await prisma.lecture.create({
        data: {
          teachingAssignmentId: lecture.teachingAssignmentId,
          date: new Date(lecture.date),
        },
      });
      created++;
    }
  }

  console.log(`✅ Seeded ${lecturesBackupData.length} lectures (${created} created, ${updated} updated)`);
}
