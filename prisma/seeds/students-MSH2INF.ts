import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH2INF() {
  console.log("🌱 Seeding students for MSH2INF...");

  const studentsMSH2INF = [
    { firstName: "Elvis", lastName: "Dylgjeri", institutionEmail: "edylgjeri@uet.edu.al", father: "Ferit", personalEmail: "elvisdylgjeri1@gmail.com", phone: "0692175520", orderId: 1, classId: 15 },
    { firstName: "Korab", lastName: "Kuçi", institutionEmail: "kkuci4@uet.edu.al", father: "Shpetim", personalEmail: "kucikorab05@gmail.com", phone: "0696330338", orderId: 2, classId: 15 },

  ];

  await prisma.student.createMany({
    data: studentsMSH2INF,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH2INF.length} students for MSH2INF!`);
}

seedStudentsMSH2INF()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH2INF:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
