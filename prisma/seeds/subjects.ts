import type { PrismaClient } from "../prisma";

export async function seedSubjects(prisma: PrismaClient) {
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
