import type { PrismaClient } from "../prisma";

export async function seedPrograms(prisma: PrismaClient) {
  console.log("📚 Seeding programs...");
  
  // Insert Programs (Bachelor & Master)
  await prisma.program.createMany({
    data: [{ name: "Bachelor" }, { name: "Master" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  
  console.log("✅ Programs seeded successfully!");
}
