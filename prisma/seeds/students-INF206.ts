import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsINF206() {
  console.log("🌱 Seeding students for INF206...");

  const studentsINF206 = [
    { firstName: "Amald", lastName: "Bedini", email: "abedini5@uet.edu.al", classId: 6 },
  ];

  await prisma.student.createMany({
    data: studentsINF206,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsINF206.length} student(s) for INF206!`);
}

seedStudentsINF206()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for INF206:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
