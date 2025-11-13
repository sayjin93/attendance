import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedSubjects() {
  console.log("📝 Seeding subjects...");
  
  // Insert Subjects
  const subjects = [
    {
      id: 1,
      code: "CIS242/B",
      name: "Teori e bazave të të dhënave",
      programId: 1,
    },
    {
      id: 2,
      code: "CIS280",
      name: "Web Development",
      programId: 1,
    },
    {
      id: 3,
      code: "CIS518",
      name: "Projektim dhe analizë e bazave të të dhënave",
      programId: 2,
    },
    {
      id: 4,
      code: "CIS555",
      name: "Zhvillim webi: aplikime dhe programim",
      programId: 2,
    },
  ];
  
  await prisma.subject.createMany({
    data: subjects,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  
  console.log("✅ Subjects seeded successfully!");
}

// Allow direct execution
if (require.main === module) {
  seedSubjects()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error("❌ Error seeding subjects:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}