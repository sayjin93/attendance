import type { PrismaClient } from "../prisma";

export interface LectureBackup {
  id: number;
  teachingAssignmentId: number;
  date: string; // ISO 8601 format
}

export const lecturesBackupData: LectureBackup[] = [
  {
    "id": 1,
    "teachingAssignmentId": 1,
    "date": "2025-10-06"
  },
  {
    "id": 2,
    "teachingAssignmentId": 2,
    "date": "2025-10-06"
  },
  {
    "id": 3,
    "teachingAssignmentId": 3,
    "date": "2025-10-06"
  },
  {
    "id": 4,
    "teachingAssignmentId": 1,
    "date": "2025-10-13"
  },
  {
    "id": 5,
    "teachingAssignmentId": 2,
    "date": "2025-10-13"
  },
  {
    "id": 6,
    "teachingAssignmentId": 3,
    "date": "2025-10-13"
  },
  {
    "id": 7,
    "teachingAssignmentId": 1,
    "date": "2025-10-20"
  },
  {
    "id": 8,
    "teachingAssignmentId": 2,
    "date": "2025-10-20"
  },
  {
    "id": 9,
    "teachingAssignmentId": 3,
    "date": "2025-10-20"
  },
  {
    "id": 10,
    "teachingAssignmentId": 4,
    "date": "2025-10-25"
  },
  {
    "id": 11,
    "teachingAssignmentId": 5,
    "date": "2025-10-25"
  },
  {
    "id": 12,
    "teachingAssignmentId": 6,
    "date": "2025-10-25"
  },
  {
    "id": 13,
    "teachingAssignmentId": 7,
    "date": "2025-10-25"
  },
  {
    "id": 14,
    "teachingAssignmentId": 8,
    "date": "2025-10-25"
  },
  {
    "id": 15,
    "teachingAssignmentId": 9,
    "date": "2025-10-25"
  },
  {
    "id": 16,
    "teachingAssignmentId": 1,
    "date": "2025-10-27"
  },
  {
    "id": 17,
    "teachingAssignmentId": 2,
    "date": "2025-10-27"
  },
  {
    "id": 18,
    "teachingAssignmentId": 3,
    "date": "2025-10-27"
  },
  {
    "id": 19,
    "teachingAssignmentId": 4,
    "date": "2025-11-01"
  },
  {
    "id": 20,
    "teachingAssignmentId": 5,
    "date": "2025-11-01"
  },
  {
    "id": 21,
    "teachingAssignmentId": 6,
    "date": "2025-11-01"
  },
  {
    "id": 22,
    "teachingAssignmentId": 7,
    "date": "2025-11-01"
  },
  {
    "id": 23,
    "teachingAssignmentId": 8,
    "date": "2025-11-01"
  },
  {
    "id": 24,
    "teachingAssignmentId": 9,
    "date": "2025-11-01"
  },
  {
    "id": 25,
    "teachingAssignmentId": 1,
    "date": "2025-11-03"
  },
  {
    "id": 26,
    "teachingAssignmentId": 2,
    "date": "2025-11-03"
  },
  {
    "id": 27,
    "teachingAssignmentId": 3,
    "date": "2025-11-03"
  },
  {
    "id": 28,
    "teachingAssignmentId": 4,
    "date": "2025-11-08"
  },
  {
    "id": 29,
    "teachingAssignmentId": 5,
    "date": "2025-11-08"
  },
  {
    "id": 30,
    "teachingAssignmentId": 6,
    "date": "2025-11-08"
  },
  {
    "id": 31,
    "teachingAssignmentId": 7,
    "date": "2025-11-08"
  },
  {
    "id": 32,
    "teachingAssignmentId": 8,
    "date": "2025-11-08"
  },
  {
    "id": 33,
    "teachingAssignmentId": 9,
    "date": "2025-11-08"
  },
  {
    "id": 34,
    "teachingAssignmentId": 1,
    "date": "2025-11-10"
  },
  {
    "id": 35,
    "teachingAssignmentId": 2,
    "date": "2025-11-10"
  },
  {
    "id": 36,
    "teachingAssignmentId": 3,
    "date": "2025-11-10"
  },
  {
    "id": 37,
    "teachingAssignmentId": 4,
    "date": "2025-11-15"
  },
  {
    "id": 38,
    "teachingAssignmentId": 6,
    "date": "2025-11-15"
  },
  {
    "id": 39,
    "teachingAssignmentId": 5,
    "date": "2025-11-15"
  },
  {
    "id": 40,
    "teachingAssignmentId": 7,
    "date": "2025-11-15"
  },
  {
    "id": 41,
    "teachingAssignmentId": 8,
    "date": "2025-11-15"
  },
  {
    "id": 42,
    "teachingAssignmentId": 9,
    "date": "2025-11-15"
  },
  {
    "id": 43,
    "teachingAssignmentId": 1,
    "date": "2025-11-17"
  },
  {
    "id": 44,
    "teachingAssignmentId": 2,
    "date": "2025-11-17"
  },
  {
    "id": 45,
    "teachingAssignmentId": 3,
    "date": "2025-11-17"
  },
  {
    "id": 46,
    "teachingAssignmentId": 4,
    "date": "2025-11-22"
  },
  {
    "id": 47,
    "teachingAssignmentId": 6,
    "date": "2025-11-22"
  },
  {
    "id": 48,
    "teachingAssignmentId": 5,
    "date": "2025-11-22"
  },
  {
    "id": 49,
    "teachingAssignmentId": 7,
    "date": "2025-11-22"
  },
  {
    "id": 50,
    "teachingAssignmentId": 8,
    "date": "2025-11-22"
  },
  {
    "id": 51,
    "teachingAssignmentId": 9,
    "date": "2025-11-22"
  },
  {
    "id": 52,
    "teachingAssignmentId": 4,
    "date": "2025-12-06"
  },
  {
    "id": 53,
    "teachingAssignmentId": 6,
    "date": "2025-12-06"
  },
  {
    "id": 54,
    "teachingAssignmentId": 8,
    "date": "2025-12-06"
  },
  {
    "id": 55,
    "teachingAssignmentId": 5,
    "date": "2025-12-06"
  },
  {
    "id": 56,
    "teachingAssignmentId": 7,
    "date": "2025-12-06"
  },
  {
    "id": 57,
    "teachingAssignmentId": 9,
    "date": "2025-12-06"
  },
  {
    "id": 58,
    "teachingAssignmentId": 4,
    "date": "2025-12-13"
  },
  {
    "id": 59,
    "teachingAssignmentId": 5,
    "date": "2025-12-13"
  },
  {
    "id": 60,
    "teachingAssignmentId": 6,
    "date": "2025-12-13"
  },
  {
    "id": 61,
    "teachingAssignmentId": 7,
    "date": "2025-12-13"
  },
  {
    "id": 62,
    "teachingAssignmentId": 8,
    "date": "2025-12-13"
  },
  {
    "id": 63,
    "teachingAssignmentId": 9,
    "date": "2025-12-13"
  },
  {
    "id": 64,
    "teachingAssignmentId": 1,
    "date": "2025-12-15"
  },
  {
    "id": 65,
    "teachingAssignmentId": 2,
    "date": "2025-12-15"
  },
  {
    "id": 66,
    "teachingAssignmentId": 3,
    "date": "2025-12-15"
  },
  {
    "id": 67,
    "teachingAssignmentId": 2,
    "date": "2026-01-05"
  },
  {
    "id": 68,
    "teachingAssignmentId": 1,
    "date": "2026-01-05"
  },
  {
    "id": 69,
    "teachingAssignmentId": 3,
    "date": "2026-01-05"
  },
  {
    "id": 70,
    "teachingAssignmentId": 4,
    "date": "2026-01-10"
  },
  {
    "id": 71,
    "teachingAssignmentId": 5,
    "date": "2026-01-10"
  },
  {
    "id": 72,
    "teachingAssignmentId": 6,
    "date": "2026-01-10"
  },
  {
    "id": 73,
    "teachingAssignmentId": 7,
    "date": "2026-01-10"
  },
  {
    "id": 74,
    "teachingAssignmentId": 8,
    "date": "2026-01-10"
  },
  {
    "id": 75,
    "teachingAssignmentId": 9,
    "date": "2026-01-10"
  },
  {
    "id": 76,
    "teachingAssignmentId": 2,
    "date": "2026-01-12"
  },
  {
    "id": 77,
    "teachingAssignmentId": 1,
    "date": "2026-01-12"
  },
  {
    "id": 78,
    "teachingAssignmentId": 3,
    "date": "2026-01-12"
  },
  {
    "id": 79,
    "teachingAssignmentId": 4,
    "date": "2026-01-17"
  },
  {
    "id": 80,
    "teachingAssignmentId": 5,
    "date": "2026-01-17"
  },
  {
    "id": 81,
    "teachingAssignmentId": 6,
    "date": "2026-01-17"
  },
  {
    "id": 82,
    "teachingAssignmentId": 7,
    "date": "2026-01-17"
  },
  {
    "id": 83,
    "teachingAssignmentId": 8,
    "date": "2026-01-17"
  },
  {
    "id": 84,
    "teachingAssignmentId": 9,
    "date": "2026-01-17"
  },
  {
    "id": 85,
    "teachingAssignmentId": 2,
    "date": "2026-01-19"
  },
  {
    "id": 86,
    "teachingAssignmentId": 1,
    "date": "2026-01-19"
  },
  {
    "id": 87,
    "teachingAssignmentId": 3,
    "date": "2026-01-19"
  },
  {
    "id": 88,
    "teachingAssignmentId": 4,
    "date": "2026-01-24"
  },
  {
    "id": 89,
    "teachingAssignmentId": 5,
    "date": "2026-01-24"
  },
  {
    "id": 90,
    "teachingAssignmentId": 6,
    "date": "2026-01-24"
  },
  {
    "id": 91,
    "teachingAssignmentId": 7,
    "date": "2026-01-24"
  },
  {
    "id": 92,
    "teachingAssignmentId": 8,
    "date": "2026-01-24"
  },
  {
    "id": 93,
    "teachingAssignmentId": 9,
    "date": "2026-01-24"
  },
  {
    "id": 94,
    "teachingAssignmentId": 1,
    "date": "2026-01-26"
  },
  {
    "id": 95,
    "teachingAssignmentId": 2,
    "date": "2026-01-26"
  },
  {
    "id": 96,
    "teachingAssignmentId": 3,
    "date": "2026-01-26"
  },
  {
    "id": 97,
    "teachingAssignmentId": 4,
    "date": "2026-01-31"
  },
  {
    "id": 98,
    "teachingAssignmentId": 5,
    "date": "2026-01-31"
  },
  {
    "id": 99,
    "teachingAssignmentId": 6,
    "date": "2026-01-31"
  },
  {
    "id": 100,
    "teachingAssignmentId": 7,
    "date": "2026-01-31"
  },
  {
    "id": 101,
    "teachingAssignmentId": 8,
    "date": "2026-01-31"
  },
  {
    "id": 102,
    "teachingAssignmentId": 9,
    "date": "2026-01-31"
  },
  {
    "id": 103,
    "teachingAssignmentId": 1,
    "date": "2026-02-02"
  },
  {
    "id": 104,
    "teachingAssignmentId": 2,
    "date": "2026-02-02"
  },
  {
    "id": 105,
    "teachingAssignmentId": 3,
    "date": "2026-02-02"
  },
  {
    "id": 106,
    "teachingAssignmentId": 4,
    "date": "2026-02-07"
  },
  {
    "id": 107,
    "teachingAssignmentId": 5,
    "date": "2026-02-07"
  },
  {
    "id": 108,
    "teachingAssignmentId": 6,
    "date": "2026-02-07"
  },
  {
    "id": 109,
    "teachingAssignmentId": 7,
    "date": "2026-02-07"
  },
  {
    "id": 110,
    "teachingAssignmentId": 8,
    "date": "2026-02-07"
  },
  {
    "id": 111,
    "teachingAssignmentId": 9,
    "date": "2026-02-07"
  },
  {
    "id": 112,
    "teachingAssignmentId": 4,
    "date": "2026-02-14"
  },
  {
    "id": 113,
    "teachingAssignmentId": 5,
    "date": "2026-02-14"
  },
  {
    "id": 114,
    "teachingAssignmentId": 6,
    "date": "2026-02-14"
  },
  {
    "id": 115,
    "teachingAssignmentId": 7,
    "date": "2026-02-14"
  },
  {
    "id": 116,
    "teachingAssignmentId": 8,
    "date": "2026-02-14"
  },
  {
    "id": 117,
    "teachingAssignmentId": 9,
    "date": "2026-02-14"
  }
];

export async function seedLectures(prisma: PrismaClient) {
  console.log("📚 Seeding lectures...");

  const result = await prisma.lecture.createMany({
    data: lecturesBackupData.map((l) => ({
      teachingAssignmentId: l.teachingAssignmentId,
      date: new Date(l.date),
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${result.count} lectures (${lecturesBackupData.length - result.count} skipped)`);
}
