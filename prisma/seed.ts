import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding the database...");

  // Insert Proffesors
  const professors = [
    {
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "info@jkruja.com",
      password: await bcrypt.hash("Adm!n2025", 10),
      isAdmin: true,
    },
    {
      firstName: "Jurgen",
      lastName: "Kruja",
      username: "jurgenkruja",
      email: "jurgen.kruja@uet.edu.al",
      password: await bcrypt.hash("germany6", 10),
      isAdmin: false,
    },
  ];
  await prisma.professor.createMany({
    data: professors,
    skipDuplicates: true, // ✅ This prevents errors if a professor already exists
  });
  console.log("✅ Professors seeded successfully!");

  // Insert Programs (Bachelor & Master)
  await prisma.program.createMany({
    data: [{ name: "Bachelor" }, { name: "Master" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Programs seeded successfully!");

  // Insert TeachingType (Lecture & Seminar)
  await prisma.teachingType.createMany({
    data: [{ name: "Leksion" }, { name: "Seminar" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ TeachingType seeded successfully!");

  // Insert Classes
  const classes = [
    {
      id: 1,
      name: "INF201",
      programId: 1,
    },
    {
      id: 2,
      name: "INF202",
      programId: 1,
    },
    {
      id: 3,
      name: "INF203",
      programId: 1,
    },
    {
      id: 4,
      name: "INF204",
      programId: 1,
    },
    {
      id: 5,
      name: "INF205",
      programId: 1,
    },
    {
      id: 6,
      name: "INF206",
      programId: 1,
    },
    {
      id: 7,
      name: "Infoek201",
      programId: 1,
    },
    {
      id: 8,
      name: "Infoek202",
      programId: 1,
    },
    {
      id: 9,
      name: "TI201",
      programId: 1,
    },
    {
      id: 10,
      name: "TI202",
      programId: 1,
    },
    {
      id: 11,
      name: "MSH1IE",
      programId: 2,
    },
    {
      id: 12,
      name: "MSH1INFA",
      programId: 2,
    },
    {
      id: 13,
      name: "MSH1INFB",
      programId: 2,
    },
    {
      id: 14,
      name: "MSH1TI",
      programId: 2,
    },
  ];
  await prisma.class.createMany({
    data: classes,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Classes seeded successfully!");

  // NOTE: Students are seeded separately using individual seed files
  // See prisma/seeds/ directory for class-specific student seed files
  // Run them with: npx tsx prisma/seeds/students-[ClassName].ts

  // Insert Subjects
  const subjects = [
    {
      id: 1,
      code: "CIS242/B",
      name: "Teori e bazave të të dhënave",
      programId: 1,
    },
    {
      id: 2,
      code: "CIS280",
      name: "Web Development",
      programId: 1,
    },
    {
      id: 3,
      code: "CIS518",
      name: "Projektim dhe analizë e bazave të të dhënave",
      programId: 2,
    },
    {
      id: 4,
      code: "CIS555",
      name: "Zhvillim webi: aplikime dhe programim",
      programId: 2,
    },
  ];
  await prisma.subject.createMany({
    data: subjects,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Subjects seeded successfully!");

  // Insert TeachingAssignments (linking Professors with Subjects, Classes, and Types)
  const teachingAssignments = [
    // Jurgen Kruja teaching Database Theory to INF201 (Bachelor)
    {
      professorId: 2, // Jurgen Kruja
      subjectId: 1, // Teori e bazave të të dhënave
      classId: 5, // INF205
      typeId: 2, // Seminar
    },
    {
      professorId: 2, // Jurgen Kruja
      subjectId: 1, // Teori e bazave të të dhënave
      classId: 6, // INF206
      typeId: 2, // Seminar
    },
    {
      professorId: 2, // Jurgen Kruja
      subjectId: 1, // Teori e bazave të të dhënave
      classId: 8, // Infoek202
      typeId: 2, // Seminar
    },
    // Jurgen Kruja teaching Database Design to Master classes
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 11, // IE (Master)
      typeId: 2, // Seminar
    },
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 12, // INFA (Master)
      typeId: 2, // Seminar
    },
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 13, // INFB (Master)
      typeId: 2, // Seminar
    },
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 14, // TI (Master)
      typeId: 2, // Seminar
    },
  ];
  await prisma.teachingAssignment.createMany({
    data: teachingAssignments,
    skipDuplicates: true,
  });
  console.log("✅ Teaching Assignments seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });