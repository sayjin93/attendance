import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedPrograms() {
  console.log("📚 Seeding programs...");
  
  // Insert Programs (Bachelor & Master)
  await prisma.program.createMany({
    data: [{ name: "Bachelor" }, { name: "Master" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  
  console.log("✅ Programs seeded successfully!");
}

// Allow direct execution
if (require.main === module) {
  seedPrograms()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error("❌ Error seeding programs:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}