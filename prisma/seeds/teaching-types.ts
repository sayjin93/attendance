import type { PrismaClient } from "../prisma";

export async function seedTeachingTypes(prisma: PrismaClient) {
  console.log("📖 Seeding teaching types...");
  
  // Insert TeachingType (Lecture & Seminar)
  await prisma.teachingType.createMany({
    data: [{ name: "Leksion" }, { name: "Seminar" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  
  console.log("✅ TeachingType seeded successfully!");
}
