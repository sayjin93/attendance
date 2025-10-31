import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1INFA() {
  console.log("🌱 Seeding students for MSH1INFA...");

  const studentsMSH1INFA = [
    { firstName: "Student", lastName: "INF A", email: "studentinfa@uet.edu.al", classId: 15 },
  ];

  await prisma.student.createMany({
    data: studentsMSH1INFA,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1INFA.length} student(s) for MSH1INFA!`);
}

seedStudentsMSH1INFA()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH1INFA:", e);
    await prisma.$disconnect();
    process.exit(1);
  });