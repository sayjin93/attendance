import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding the database...");

  // Insert Programs (Bachelor & Master)
  await prisma.program.createMany({
    data: [{ name: "Bachelor" }, { name: "Master" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Programs seeded successfully!");

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
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
