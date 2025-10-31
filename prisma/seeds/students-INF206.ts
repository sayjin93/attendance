import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsINF206() {
  console.log("🌱 Seeding students for INF206...");

  const studentsINF206 = [
    { firstName: "Andrea", lastName: "Abeshi", email: "aabeshi@uet.edu.al", classId: 6 },
    { firstName: "Amald", lastName: "Bedini", email: "abedini5@uet.edu.al", classId: 6 },
    { firstName: "Agim", lastName: "Çeka", email: "aceka6@uet.edu.al", classId: 6 },
    { firstName: "Ergis", lastName: "Çollaku", email: "ecollaku3@uet.edu.al", classId: 6 },
    { firstName: "Rei", lastName: "Duçka", email: "rducka@uet.edu.al", classId: 6 },
    { firstName: "Melisa", lastName: "Gjegja", email: "mgjegja@uet.edu.al", classId: 6 },
    { firstName: "Samir", lastName: "Haxhiu", email: "shaxhiu3@uet.edu.al", classId: 6 },
    { firstName: "Kristi", lastName: "Kanani", email: "kkanani3@uet.edu.al", classId: 6 },
    { firstName: "Jozef", lastName: "Lisi", email: "jlisi@uet.edu.al", classId: 6 },
    { firstName: "Egdar", lastName: "Shaqiri", email: "eshaqiri6@uet.edu.al", classId: 6 },
    { firstName: "Florian", lastName: "Shurbi", email: "fshurbi@uet.edu.al", classId: 6 },
    { firstName: "Denis", lastName: "Sokoli", email: "dsokoli2@uet.edu.al", classId: 6 },
  ];

  await prisma.student.createMany({
    data: studentsINF206,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsINF206.length} student(s) for INF206!`);
}

seedStudentsINF206()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for INF206:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
