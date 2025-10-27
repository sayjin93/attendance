import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1TI() {
  console.log("🌱 Seeding students for MSH1TI...");

  const studentsMSH1TI = [
    { firstName: "Arlind", lastName: "Balla", email: "aballa11@uet.edu.al", classId: 14 },
    { firstName: "Arbi", lastName: "Çangu", email: "acangu@uet.edu.al", classId: 14 },
    { firstName: "Griselda", lastName: "Cura", email: "gcura@uet.edu.al", classId: 14 },
    { firstName: "Ergita", lastName: "Curri", email: "ecurri1@uet.edu.al", classId: 14 },
    { firstName: "Robert", lastName: "Feinaj", email: "rfeinaj@uet.edu.al", classId: 14 },
    { firstName: "Bleona", lastName: "Gazulli", email: "bgazulli2@uet.edu.al", classId: 14 },
    { firstName: "Horges", lastName: "Kaca", email: "hkaca@uet.edu.al", classId: 14 },
    { firstName: "Xhoalina", lastName: "Karasani", email: "xkarasani@uet.edu.al", classId: 14 },
    { firstName: "Mario", lastName: "Lipo", email: "mlipo@uet.edu.al", classId: 14 },
    { firstName: "Redjon", lastName: "Lleshaj", email: "rlleshaj@uet.edu.al", classId: 14 },
    { firstName: "Ergi", lastName: "Mankollari", email: "emankollari@uet.edu.al", classId: 14 },
    { firstName: "Arsa", lastName: "Picari", email: "apicari1@uet.edu.al", classId: 14 },
    { firstName: "Frenklin", lastName: "Saliasi", email: "fsaliasi@uet.edu.al", classId: 14 },
    { firstName: "Xhoilda", lastName: "Vuksanaj", email: "xvuksanaj@uet.edu.al", classId: 14 },
    { firstName: "Endrit", lastName: "Zharri", email: "ezharri@uet.edu.al", classId: 14 },
  ];

  await prisma.student.createMany({
    data: studentsMSH1TI,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1TI.length} students for MSH1TI!`);
}

seedStudentsMSH1TI()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH1TI:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
