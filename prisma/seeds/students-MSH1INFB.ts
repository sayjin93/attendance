import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1INFB() {
  console.log("🌱 Seeding students for MSH1INFB...");

  const studentsMSH1INFB = [
    { firstName: "Student", lastName: "INF B", email: "studentinfb@uet.edu.al", classId: 16 },
  ];

  await prisma.student.createMany({
    data: studentsMSH1INFB,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1INFB.length} student(s) for MSH1INFB!`);
}

seedStudentsMSH1INFB()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH1INFB:", e);
    await prisma.$disconnect();
    process.exit(1);
  });