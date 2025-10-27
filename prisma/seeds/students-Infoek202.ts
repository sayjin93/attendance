import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsInfoek202() {
  console.log("🌱 Seeding students for Infoek202...");

  const studentsInfoek202 = [
    { firstName: "Eldjon", lastName: "Beharaj", email: "ebeharaj@uet.edu.al", classId: 8 },
    { firstName: "Alesia", lastName: "Bufi", email: "abufi2@uet.edu.al", classId: 8 },
    { firstName: "Esa", lastName: "Deliu", email: "edeliu3@uet.edu.al", classId: 8 },
    { firstName: "Eni", lastName: "Dema", email: "edema7@uet.edu.al", classId: 8 },
    { firstName: "Aqilea", lastName: "Gaqos", email: "agaqos@uet.edu.al", classId: 8 },
    { firstName: "Marjela", lastName: "Gjeloshaj", email: "mgjeloshaj@uet.edu.al", classId: 8 },
    { firstName: "Lorenzo", lastName: "Gjeloshi", email: "lgjeloshi@uet.edu.al", classId: 8 },
    { firstName: "Vanesa", lastName: "Gjika", email: "vgjika2@uet.edu.al", classId: 8 },
    { firstName: "Anisa", lastName: "Hajdari", email: "ahajdari8@uet.edu.al", classId: 8 },
    { firstName: "Mario", lastName: "Hajderdhi", email: "mhajderdhi@uet.edu.al", classId: 8 },
    { firstName: "Ronela", lastName: "Hoxha", email: "rhoxha24@uet.edu.al", classId: 8 },
    { firstName: "Klea Joana", lastName: "Kodhelaj", email: "kkodhelaj@uet.edu.al", classId: 8 },
    { firstName: "Klajdi", lastName: "Kola", email: "kkola10@uet.edu.al", classId: 8 },
    { firstName: "Sevastianos", lastName: "Korreshi", email: "skorreshi@uet.edu.al", classId: 8 },
    { firstName: "Kristjen", lastName: "Kurti", email: "kkurti9@uet.edu.al", classId: 8 },
    { firstName: "Irakli", lastName: "Mitro", email: "imitro@uet.edu.al", classId: 8 },
    { firstName: "Skender", lastName: "Muçka", email: "smucka2@uet.edu.al", classId: 8 },
    { firstName: "Asel", lastName: "Nela", email: "anela2@uet.edu.al", classId: 8 },
    { firstName: "Almedina", lastName: "Piranaj", email: "apiranaj2@uet.edu.al", classId: 8 },
    { firstName: "Albiona", lastName: "Qinami", email: "aqinami6@uet.edu.al", classId: 8 },
    { firstName: "Selma", lastName: "Qoku", email: "sqoku@uet.edu.al", classId: 8 },
    { firstName: "Amelja", lastName: "Rrapaj", email: "arrapaj@uet.edu.al", classId: 8 },
    { firstName: "Erisa", lastName: "Sadikaj", email: "esadikaj4@uet.edu.al", classId: 8 },
    { firstName: "Ertugel", lastName: "Saliaj", email: "esaliaj11@uet.edu.al", classId: 8 },
    { firstName: "Sara", lastName: "Shehu", email: "sshehu16@uet.edu.al", classId: 8 },
    { firstName: "Justin", lastName: "Shtëpani", email: "jshtepani@uet.edu.al", classId: 8 },
    { firstName: "Amela", lastName: "Subashaj", email: "asubashaj@uet.edu.al", classId: 8 },
    { firstName: "Alesjo", lastName: "Sula", email: "asula17@uet.edu.al", classId: 8 },
    { firstName: "Olta", lastName: "Xhardo", email: "oxhardo@uet.edu.al", classId: 8 },
    { firstName: "Detjon", lastName: "Xhepi", email: "dxhepi@uet.edu.al", classId: 8 },
    { firstName: "Klea", lastName: "Zhaboli", email: "kzhaboli@uet.edu.al", classId: 8 },
  ];

  await prisma.student.createMany({
    data: studentsInfoek202,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsInfoek202.length} students for Infoek202!`);
}

seedStudentsInfoek202()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for Infoek202:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
