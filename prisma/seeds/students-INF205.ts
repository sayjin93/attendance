import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsINF205() {
  console.log("🌱 Seeding students for INF205...");

  const studentsINF205 = [
    {
      firstName: "Elios",
      father: "Eduard",
      lastName: "Deliu",
      institutionEmail: "edeliu4@uet.edu.al",
      personalEmail: "eliodeliu319@gmail.com",
      phone: "0693715271",
      memo: null,
      orderId: 1,
      classId: 5
    },
    {
      firstName: "Enri",
      father: "Nazmi",
      lastName: "Elezi",
      institutionEmail: "eelezi11@uet.edu.al",
      personalEmail: "elezienri@gmail.com",
      phone: "0683413975",
      memo: null,
      orderId: 2,
      classId: 5
    },
    {
      firstName: "Geraldina",
      father: "Ferit",
      lastName: "Farruku",
      institutionEmail: "gfarruku3@uet.edu.al",
      personalEmail: "gerifarruku4@gmail.com",
      phone: "0682574745",
      memo: null,
      orderId: 3,
      classId: 5
    },
    {
      firstName: "Melisa",
      father: "Altin",
      lastName: "Fezo",
      institutionEmail: "mfezo@uet.edu.al",
      personalEmail: "melisafezo8@gmail.com",
      phone: "0695819330",
      memo: null,
      orderId: 4,
      classId: 5
    },
    {
      firstName: "Klindi",
      father: "Armand",
      lastName: "Fida",
      institutionEmail: "kfida@uet.edu.al",
      personalEmail: "klindifida9@gmail.com",
      phone: "0682268143",
      memo: null,
      orderId: 5,
      classId: 5
    },
    {
      firstName: "Fiona",
      father: "Pellumb",
      lastName: "Guma",
      institutionEmail: "fguma@uet.edu.al",
      personalEmail: "fionaguma25@gmail.com",
      phone: "0683798226",
      orderId: 6,
      classId: 5
    },
    {
      firstName: "Kledisa",
      father: "Astrit",
      lastName: "Haka",
      institutionEmail: "khaka4@uet.edu.al",
      personalEmail: "kledisa.haka@gmail.com",
      phone: "0676292159",
      orderId: 7,
      classId: 5
    },
    {
      firstName: "Rejdian",
      father: "Agron",
      lastName: "Hyka",
      institutionEmail: "rhyka6@uet.edu.al",
      personalEmail: "hykrejdian9@gmail.com",
      phone: "0695269911",
      orderId: 8,
      classId: 5
    },
    {
      firstName: "Jurgi",
      father: "Gentian",
      lastName: "Kule",
      institutionEmail: "jkule@uet.edu.al",
      personalEmail: "jorgikule@gmail.com",
      phone: "0683425708",
      orderId: 9,
      classId: 5
    },
    {
      firstName: "Oligert",
      father: "Resmi",
      lastName: "Maksuti",
      institutionEmail: "omaksuti@uet.edu.al",
      personalEmail: "oligertmaksuti256@gmail.com",
      phone: "0683884953",
      orderId: 10,
      classId: 5
    },
    {
      firstName: "Nelson",
      father: "Ervin",
      lastName: "Manxharaj",
      institutionEmail: "nmanxharaj@uet.edu.al",
      personalEmail: "nelsonmanxharaj1@gmail.com",
      phone: "0683884216",
      orderId: 11,
      classId: 5
    },
    {
      firstName: "Flavio",
      father: "Elton",
      lastName: "Mema",
      institutionEmail: "fmema3@uet.edu.al",
      personalEmail: "flaviomema23@gmail.com",
      phone: "0692245605",
      orderId: 12,
      classId: 5
    },
    {
      firstName: "Greta",
      father: "Vasil",
      lastName: "Ndoj",
      institutionEmail: "gndoj@uet.edu.al",
      personalEmail: "gretandoj82@gmail.com",
      phone: "0684431646",
      orderId: 13,
      classId: 5
    },
    {
      firstName: "Erlis",
      father: "Xhevahir",
      lastName: "Paloka",
      institutionEmail: "epaloka2@uet.edu.al",
      personalEmail: "erlispaloka01@gmail.com",
      phone: "0682798697",
      orderId: 14,
      classId: 5
    },
    {
      firstName: "Luis",
      father: "Gramos",
      lastName: "Shpërdhea",
      institutionEmail: "lshperdhea@uet.edu.al",
      personalEmail: "brunildashperdhea@gmail.com",
      phone: "0685413934",
      orderId: 15,
      classId: 5
    },
    {
      firstName: "Daniel",
      father: "Fadil",
      lastName: "Skënderaj",
      institutionEmail: "dskenderaj@uet.edu.al",
      personalEmail: "danielskenderaj606@gmail.com",
      phone: "0685376619",
      orderId: 16,
      classId: 5
    },
    {
      firstName: "Arvin",
      father: "Gentian",
      lastName: "Xhelilaj",
      institutionEmail: "axhelilaj3@uet.edu.al",
      personalEmail: "xhelilajarvii28@gmail.com",
      phone: "0692251609",
      orderId: 17,
      classId: 5
    },
    {
      firstName: "Flavio",
      father: "Fatbardh",
      lastName: "Zani",
      institutionEmail: "fzani@uet.edu.al",
      personalEmail: "flaviozani659@gmail.com",
      phone: "0659190740",
      orderId: 18,
      classId: 5
    }
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
