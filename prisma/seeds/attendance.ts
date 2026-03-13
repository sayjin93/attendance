// Attendance Dummy Seed Data
// Every student gets an attendance record for every lecture belonging to their class

import type { PrismaClient } from "../prisma";

// Deterministic pseudo-random number generator (mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomStatus(random: () => number): number {
  const r = random();
  if (r < 0.70) return 1;      // PRESENT
  if (r < 0.85) return 2;      // ABSENT
  if (r < 0.95) return 3;      // PARTICIPATED
  return 4;                     // LEAVE
}

export async function seedAttendance(prisma: PrismaClient) {
  console.log('📝 Generating attendance data (every student × every class lecture)...');

  const random = mulberry32(42);

  // Fetch students grouped by class
  const students = await prisma.student.findMany({
    select: { id: true, classId: true },
  });

  // Fetch lectures with their class (via teachingAssignment)
  const lectures = await prisma.lecture.findMany({
    select: { id: true, teachingAssignment: { select: { classId: true } } },
  });

  // Group lecture IDs by classId
  const lecturesByClass = new Map<number, number[]>();
  for (const lecture of lectures) {
    const classId = lecture.teachingAssignment.classId;
    if (!lecturesByClass.has(classId)) lecturesByClass.set(classId, []);
    lecturesByClass.get(classId)!.push(lecture.id);
  }

  // Build records: each student gets attendance for every lecture in their class
  const records: { studentId: number; lectureId: number; statusId: number }[] = [];
  for (const student of students) {
    const classLectures = lecturesByClass.get(student.classId) ?? [];
    for (const lectureId of classLectures) {
      records.push({ studentId: student.id, lectureId, statusId: randomStatus(random) });
    }
  }

  console.log(`  Generated ${records.length} records`);

  const BATCH_SIZE = 100;
  let totalCreated = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(records.length / BATCH_SIZE);

    try {
      const result = await prisma.attendance.createMany({
        data: batch,
        skipDuplicates: true,
      });
      totalCreated += result.count;

      if (batchNum % 10 === 0 || batchNum === totalBatches) {
        console.log(`  📦 Batch ${batchNum}/${totalBatches} - ${totalCreated} records so far`);
      }
    } catch (error) {
      console.error(`  ❌ Error in batch ${batchNum}:`, error);
    }
  }

  console.log(`✅ Successfully seeded ${totalCreated} attendance records`);
}
