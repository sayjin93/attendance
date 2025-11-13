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
