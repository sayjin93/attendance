import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH2TI() {
  console.log("🌱 Seeding students for MSH2TI...");

  const studentsMSH2TI = [
    { 
      firstName: "Mario", 
      father: "Gjergji", 
      lastName: "Lipo", 
      institutionEmail: "mlipo@uet.edu.al", 
      personalEmail: "mario92_ko@yahoo.com", 
      phone: "0698380983", 
      memo: null, 
      orderId: 1, 
      classId: 16 
    },
  ];

  await prisma.student.createMany({
    data: studentsMSH2TI,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH2TI.length} students for MSH2TI!`);
}

seedStudentsMSH2TI()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH2TI:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
