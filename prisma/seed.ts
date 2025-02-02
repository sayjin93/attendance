import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding the database...");

  const email = "malvina.niklekaj@uet.edu.al";
  const existingProfessor = await prisma.professor.findUnique({
    where: { email },
  });

  if (!existingProfessor) {
    const hashedPassword = await bcrypt.hash("priam", 10); // 🔐 Hash the password

    await prisma.professor.create({
      data: {
        name: "Malvina Niklekaj",
        email,
        password: hashedPassword, // ✅ Store hashed password
      },
    });

    console.log("✅ Professor added successfully!");
  } else {
    console.log("⚠️ Professor already exists. Skipping...");
  }
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
