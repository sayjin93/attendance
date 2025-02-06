import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding the database...");

  const professors = [
    {
      name: "Jurgen Kruja",
      email: "jurgen.kruja@uet.edu.al",
      password: await bcrypt.hash("germany6", 10),
    },
    {
      name: "Malvina Niklekaj",
      email: "malvina.niklekaj@uet.edu.al",
      password: await bcrypt.hash("priam", 10),
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
