import { createPrismaClient, PrismaClient } from "./prisma";

import { seedProfessors } from "./seeds/professors";
import { seedPrograms } from "./seeds/programs";
import { seedTeachingTypes } from "./seeds/teaching-types";
import { seedAttendanceStatuses } from "./seeds/attendance-statuses";
import { seedClasses } from "./seeds/classes";
import { seedSubjects } from "./seeds/subjects";
import { seedTeachingAssignments } from "./seeds/teaching-assignments";
import { seedAllStudents } from "./seeds/students";
import { seedLectures } from "./seeds/lectures";
import { seedAttendance } from "./seeds/attendance";

type Step = { name: string; fn: (prisma: PrismaClient) => Promise<void> };

const steps: Step[] = [
  { name: "Professors", fn: seedProfessors },
  { name: "Programs", fn: seedPrograms },
  { name: "Teaching Types", fn: seedTeachingTypes },
  { name: "Attendance Statuses", fn: seedAttendanceStatuses },
  { name: "Classes", fn: seedClasses },
  { name: "Subjects", fn: seedSubjects },
  { name: "Teaching Assignments", fn: seedTeachingAssignments },
  { name: "Students", fn: seedAllStudents },
  { name: "Lectures", fn: seedLectures },
  { name: "Attendance", fn: seedAttendance },
];

async function main() {
  const prisma = createPrismaClient();
  const results: { name: string; ms: number; ok: boolean }[] = [];

  console.log("🌱 Seeding the database...\n");
  const totalStart = performance.now();

  for (const step of steps) {
    const start = performance.now();
    try {
      await step.fn(prisma);
      results.push({ name: step.name, ms: performance.now() - start, ok: true });
    } catch (error) {
      results.push({ name: step.name, ms: performance.now() - start, ok: false });
      console.error(`\n❌ Failed at "${step.name}":`, error);
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  const totalMs = performance.now() - totalStart;
  await prisma.$disconnect();

  // Summary
  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│           🌱 Seed Summary               │");
  console.log("├──────────────────────────┬───────┬───────┤");
  console.log("│ Step                     │ Time  │ Status│");
  console.log("├──────────────────────────┼───────┼───────┤");
  for (const r of results) {
    const name = r.name.padEnd(24);
    const time = `${(r.ms / 1000).toFixed(1)}s`.padStart(5);
    const status = r.ok ? "  ✅ " : "  ❌ ";
    console.log(`│ ${name} │ ${time} │${status}│`);
  }
  console.log("├──────────────────────────┼───────┼───────┤");
  console.log(`│ ${"Total".padEnd(24)} │ ${`${(totalMs / 1000).toFixed(1)}s`.padStart(5)} │  🏁 │`);
  console.log("└──────────────────────────┴───────┴───────┘");
}

main();