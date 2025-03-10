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
    {
      firstName: "Malvina",
      lastName: "Niklekaj",
      username: "malvinanik",
      email: "malvina.niklekaj@uet.edu.al",
      password: await bcrypt.hash("priam", 10),
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

  // Insert Classes
  const classes = [
    {
      name: "INF201",
      programId: 1,
    },
    {
      name: "INF202",
      programId: 1,
    },
    {
      name: "INF",
      programId: 2,
    },
    {
      name: "IE",
      programId: 2,
    },
    {
      name: "TI",
      programId: 2,
    },
  ];
  await prisma.class.createMany({
    data: classes,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Classes seeded successfully!");

  // Insert Students
  const students = [
    {
      firstName: "Adela",
      lastName: "Misku",
      classId: 1,
    },
    {
      firstName: "Amela",
      lastName: "Synaj",
      classId: 1,
    },
    {
      firstName: "Amelia",
      lastName: "Kuka",
      classId: 1,
    },
    {
      firstName: "Ana",
      lastName: "Zaka",
      classId: 1,
    },
    {
      firstName: "Arjana",
      lastName: "Bani",
      classId: 1,
    },
    {
      firstName: "Aurel",
      lastName: "Vogli",
      classId: 1,
    },
    {
      firstName: "Devis",
      lastName: "Guni",
      classId: 1,
    },
    {
      firstName: "Endri",
      lastName: "Kallaverja",
      classId: 1,
    },
    {
      firstName: "Erisa",
      lastName: "Hila",
      classId: 1,
    },
    {
      firstName: "Fabian",
      lastName: "Muça",
      classId: 1,
    },
    {
      firstName: "Fjori",
      lastName: "Muhaj",
      classId: 1,
    },
    {
      firstName: "Joana",
      lastName: "Hoxhaj",
      classId: 1,
    },
    {
      firstName: "Kledi",
      lastName: "Bezhani",
      classId: 1,
    },
    {
      firstName: "Kejda",
      lastName: "Synaj",
      classId: 1,
    },
    {
      firstName: "Klejvi",
      lastName: "Brisku",
      classId: 1,
    },
    {
      firstName: "Kristi",
      lastName: "Rumniçi",
      classId: 1,
    },
    {
      firstName: "Kujtim",
      lastName: "Alimaj",
      classId: 1,
    },
    {
      firstName: "Leon",
      lastName: "Beqiri",
      classId: 1,
    },
    {
      firstName: "Marjano",
      lastName: "Sotiri",
      classId: 1,
    },
    {
      firstName: "Melina",
      lastName: "Dulaj",
      classId: 1,
    },
    {
      firstName: "Nazif",
      lastName: "Salaj",
      classId: 1,
    },
    {
      firstName: "Rais",
      lastName: "Sallagaj",
      classId: 1,
    },
    {
      firstName: "Sabjan",
      lastName: "Beqiraj",
      classId: 1,
    },
    {
      firstName: "Sonild",
      lastName: "Pitushi",
      classId: 1,
    },
    {
      firstName: "Tedi",
      lastName: "Ibi",
      classId: 1,
    },
  ];
  await prisma.student.createMany({
    data: students,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Studens seeded successfully!");

  // Insert Subjects
  const subjects = [
    {
      code: "CIS280",
      name: "Web Development",
      programId: 1,
    },
    {
      code: "CIS555",
      name: "Zhvillim webi: aplikime dhe programim",
      programId: 2,
    },
  ];
  await prisma.subject.createMany({
    data: subjects,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
