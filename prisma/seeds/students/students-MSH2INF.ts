import type { PrismaClient } from "../../prisma";

export async function seedStudentsMSH2INF(prisma: PrismaClient) {
  console.log("🌱 Seeding students for MSH2INF...");

  const studentsMSH2INF = [
    {
      firstName: "Elvis",
      father: "Ferit",
      lastName: "Dylgjeri",
      institutionEmail: "edylgjeri@uet.edu.al",
      personalEmail: "elvisdylgjeri1@gmail.com",
      phone: "0692175520",
      memo: "Ref. Eriklenta",
      orderId: 1,
      classId: 15,
    },
    {
      firstName: "Korab",
      father: "Shpetim",
      lastName: "Kuçi",
      institutionEmail: "kkuci4@uet.edu.al",
      personalEmail: "kucikorab05@gmail.com",
      phone: "0696330338",
      memo: null,
      orderId: 2,
      classId: 15
    },

  ];

  await prisma.student.createMany({
    data: studentsMSH2INF,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH2INF.length} students for MSH2INF!`);
}
