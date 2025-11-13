import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedTeachingTypes() {
  console.log("📖 Seeding teaching types...");
  
  // Insert TeachingType (Lecture & Seminar)
  await prisma.teachingType.createMany({
    data: [{ name: "Leksion" }, { name: "Seminar" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  
  console.log("✅ TeachingType seeded successfully!");
}

// Allow direct execution
if (require.main === module) {
  seedTeachingTypes()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error("❌ Error seeding teaching types:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}