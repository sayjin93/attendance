import { PrismaClient } from "@prisma/client";
import { seedProfessors } from "./seeds/professors";
import { seedPrograms } from "./seeds/programs";
import { seedTeachingTypes } from "./seeds/teaching-types";
import { seedAttendanceStatuses } from "./seeds/attendance-statuses";
import { seedClasses } from "./seeds/classes";
import { seedSubjects } from "./seeds/subjects";
import { seedTeachingAssignments } from "./seeds/teaching-assignments";
import { seedAllStudents } from "./seeds/students";

const prisma = new PrismaClient();

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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });