import type { PrismaClient } from "../prisma";
import bcrypt from "bcryptjs";

export async function seedProfessors(prisma: PrismaClient) {
  console.log("🧑‍🏫 Seeding professors...");
  
  // Insert Professors
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
  ];
  
  await prisma.professor.createMany({
    data: professors,
    skipDuplicates: true, // ✅ This prevents errors if a professor already exists
  });
  
  console.log("✅ Professors seeded successfully!");
}
