import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsINF205() {
  console.log("🌱 Seeding students for INF205...");

  const studentsINF205 = [
    { firstName: "Elios", lastName: "Daliu", email: "edeliu4@uet.edu.al", classId: 5 },
    { firstName: "Enri", lastName: "Elezi", email: "eelezi11@uet.edu.al", classId: 5 },
    { firstName: "Geraldina", lastName: "Farruku", email: "gfarruku3@uet.edu.al", classId: 5 },
    { firstName: "Melisa", lastName: "Fezo", email: "mfezo@uet.edu.al", classId: 5 },
    { firstName: "Fiona", lastName: "Guma", email: "fguma@uet.edu.al", classId: 5 },
    { firstName: "Kledisa", lastName: "Haka", email: "khaka4@uet.edu.al", classId: 5 },
    { firstName: "Rejdian", lastName: "Hyka", email: "rhyka6@uet.edu.al", classId: 5 },
    { firstName: "Jurgi", lastName: "Kule", email: "jkule@uet.edu.al", classId: 5 },
    { firstName: "Oligert", lastName: "Maksuti", email: "omaksuti@uet.edu.al", classId: 5 },
    { firstName: "Nelson", lastName: "Manxharaj", email: "nmanxharaj@uet.edu.al", classId: 5 },
    { firstName: "Flavio", lastName: "Mema", email: "fmema3@uet.edu.al", classId: 5 },
    { firstName: "Greta", lastName: "Ndoj", email: "gndoj@uet.edu.al", classId: 5 },
    { firstName: "Erlis", lastName: "Paloka", email: "epaloka2@uet.edu.al", classId: 5 },
    { firstName: "Edgar", lastName: "Shaqiri", email: "eshaqiri6@uet.edu.al", classId: 5 },
    { firstName: "Luis", lastName: "Shpërdhea", email: "lshperdhea@uet.edu.al", classId: 5 },
    { firstName: "Florian", lastName: "Shurbi", email: "fshurbi@uet.edu.al", classId: 5 },
    { firstName: "Daniel", lastName: "Skënderaj", email: "dskenderaj@uet.edu.al", classId: 5 },
    { firstName: "Denis", lastName: "Sokoli", email: "dsokoli2@uet.edu.al", classId: 5 },
    { firstName: "Arvin", lastName: "Xhelilaj", email: "axhelilaj3@uet.edu.al", classId: 5 },
    { firstName: "Flavio", lastName: "Zani", email: "fzani@uet.edu.al", classId: 5 },
  ];

  await prisma.student.createMany({
    data: studentsINF205,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsINF205.length} students for INF205!`);
}

seedStudentsINF205()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for INF205:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
