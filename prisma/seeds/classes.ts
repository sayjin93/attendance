import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedClasses() {
  console.log("🏫 Seeding classes...");
  
  // Insert Classes
  const classes = [
    {
      id: 1,
      name: "INF201",
      programId: 1,
    },
    {
      id: 2,
      name: "INF202",
      programId: 1,
    },
    {
      id: 3,
      name: "INF203",
      programId: 1,
    },
    {
      id: 4,
      name: "INF204",
      programId: 1,
    },
    {
      id: 5,
      name: "INF205",
      programId: 1,
    },
    {
      id: 6,
      name: "INF206",
      programId: 1,
    },
    {
      id: 7,
      name: "Infoek201",
      programId: 1,
    },
    {
      id: 8,
      name: "Infoek202",
      programId: 1,
    },
    {
      id: 9,
      name: "TI201",
      programId: 1,
    },
    {
      id: 10,
      name: "TI202",
      programId: 1,
    },
    {
      id: 11,
      name: "MSH1IE",
      programId: 2,
    },
    {
      id: 12,
      name: "MSH1INFA",
      programId: 2,
    },
    {
      id: 13,
      name: "MSH1INFB",
      programId: 2,
    },
    {
      id: 14,
      name: "MSH1TI",
      programId: 2,
    },
    {
      id: 15,
      name: "MSH2INF",
      programId: 2,
    },
    {
      id: 16,
      name: "MSH2TI",
      programId: 2,
    },
  ];
  
  await prisma.class.createMany({
    data: classes,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  
  console.log("✅ Classes seeded successfully!");
}

// Allow direct execution
if (require.main === module) {
  seedClasses()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error("❌ Error seeding classes:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}