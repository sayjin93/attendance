import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1IE() {
  console.log("🌱 Seeding students for MSH1IE...");

  const studentsMSH1IE = [
    { firstName: "", lastName: "", institutionEmail: "", father: "", personalEmail: "", phone: "", orderId: 1, classId: 11 },
  ];

  await prisma.student.createMany({
    data: studentsMSH1IE,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1IE.length} students for MSH1IE!`);
}

seedStudentsMSH1IE()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH1IE:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
