import fs from "fs";
import path from "path";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { seedProfessors } from "./seeds/professors";
import { seedPrograms } from "./seeds/programs";
import { seedTeachingTypes } from "./seeds/teaching-types";
import { seedAttendanceStatuses } from "./seeds/attendance-statuses";
import { seedClasses } from "./seeds/classes";
import { seedSubjects } from "./seeds/subjects";
import { seedTeachingAssignments } from "./seeds/teaching-assignments";
import { seedAllStudents } from "./seeds/students";

async function main() {
  console.log("🌱 Seeding the database...");

  // Seed all entities in the correct order (considering foreign key dependencies)
  await seedProfessors();
  await seedPrograms();
  await seedTeachingTypes();
  await seedAttendanceStatuses();
  await seedClasses();
  await seedSubjects();
  await seedTeachingAssignments();

  // Seed all students for all classes
  await seedAllStudents();

  // Seed lectures backup if available
  const lecturesBackupPath = path.join(__dirname, "seeds", "lectures.ts");
  if (fs.existsSync(lecturesBackupPath)) {
    console.log("📚 Restoring lectures backup...");
    const { seedLectures } = await import("./seeds/lectures");
    await seedLectures(prisma);
  } else {
    console.log("ℹ️  No lectures backup found. Skipping lectures restoration.");
  }

  // Seed attendance backup if available
  const backupPath = path.join(__dirname, "seeds", "attendance.ts");
  if (fs.existsSync(backupPath)) {
    console.log("📋 Restoring attendance backup...");
    const { seedAttendance } = await import("./seeds/attendance");
    await seedAttendance(prisma);
  } else {
    console.log("ℹ️  No attendance backup found. Skipping attendance restoration.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });