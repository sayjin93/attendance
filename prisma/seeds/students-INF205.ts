import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsINF205() {
  console.log("🌱 Seeding students for INF205...");

  const studentsINF205 = [
    { 
      firstName: "Elios", 
      lastName: "Deliu", 
      institutionEmail: "edeliu4@uet.edu.al", 
      father: "Eduard",
      personalEmail: "eliodeliu319@gmail.com",
      phone: "0693715271",
      orderId: 1,
      classId: 5 
    },
    { 
      firstName: "Enri", 
      lastName: "Elezi", 
      institutionEmail: "eelezi11@uet.edu.al", 
      father: "Nazmi",
      personalEmail: "elezienri@gmail.com",
      phone: "0683413975",
      orderId: 2,
      classId: 5 
    },
    { 
      firstName: "Geraldina", 
      lastName: "Farruku", 
      institutionEmail: "gfarruku3@uet.edu.al", 
      father: "Ferit",
      personalEmail: "gerifarruku4@gmail.com",
      phone: "0682574745",
      orderId: 3,
      classId: 5 
    },
    { 
      firstName: "Melisa", 
      lastName: "Fezo", 
      institutionEmail: "mfezo@uet.edu.al", 
      father: "Altin",
      personalEmail: "melisafezo8@gmail.com",
      phone: "0695819330",
      orderId: 4,
      classId: 5 
    },
    { 
      firstName: "Klindi", 
      lastName: "Fida", 
      institutionEmail: "kfida@uet.edu.al", 
      father: "Armand",
      personalEmail: "klindifida9@gmail.com",
      phone: "0682268143",
      orderId: 5,
      classId: 5 
    },
    { 
      firstName: "Fiona", 
      lastName: "Guma", 
      institutionEmail: "fguma@uet.edu.al", 
      father: "Pellumb",
      personalEmail: "fionaguma25@gmail.com",
      phone: "0683798226",
      orderId: 6,
      classId: 5 
    },
    { 
      firstName: "Kledisa", 
      lastName: "Haka", 
      institutionEmail: "khaka4@uet.edu.al", 
      father: "Astrit",
      personalEmail: "kledisa.haka@gmail.com",
      phone: "0676292159",
      orderId: 7,
      classId: 5 
    },
    { 
      firstName: "Rejdian", 
      lastName: "Hyka", 
      institutionEmail: "rhyka6@uet.edu.al", 
      father: "Agron",
      personalEmail: "hykrejdian9@gmail.com",
      phone: "0695269911",
      orderId: 8,
      classId: 5 
    },
    { 
      firstName: "Jurgi", 
      lastName: "Kule", 
      institutionEmail: "jkule@uet.edu.al", 
      father: "Gentian",
      personalEmail: "jorgikule@gmail.com",
      phone: "0683425708",
      orderId: 9,
      classId: 5 
    },
    { 
      firstName: "Oligert", 
      lastName: "Maksuti", 
      institutionEmail: "omaksuti@uet.edu.al", 
      father: "Resmi",
      personalEmail: "oligertmaksuti256@gmail.com",
      phone: "0683884953",
      orderId: 10,
      classId: 5 
    },
    { 
      firstName: "Nelson", 
      lastName: "Manxharaj", 
      institutionEmail: "nmanxharaj@uet.edu.al", 
      father: "Ervin",
      personalEmail: "nelsonmanxharaj1@gmail.com",
      phone: "0683884216",
      orderId: 11,
      classId: 5 
    },
    { 
      firstName: "Flavio", 
      lastName: "Mema", 
      institutionEmail: "fmema3@uet.edu.al", 
      father: "Elton",
      personalEmail: "flaviomema23@gmail.com",
      phone: "0692245605",
      orderId: 12,
      classId: 5 
    },
    { 
      firstName: "Greta", 
      lastName: "Ndoj", 
      institutionEmail: "gndoj@uet.edu.al", 
      father: "Vasil",
      personalEmail: "gretandoj82@gmail.com",
      phone: "0684431646",
      orderId: 13,
      classId: 5 
    },
    { 
      firstName: "Erlis", 
      lastName: "Paloka", 
      institutionEmail: "epaloka2@uet.edu.al", 
      father: "Xhevahir",
      personalEmail: "erlispaloka01@gmail.com",
      phone: "0682798697",
      orderId: 14,
      classId: 5 
    },
    { 
      firstName: "Luis", 
      lastName: "Shpërdhea", 
      institutionEmail: "lshperdhea@uet.edu.al", 
      father: "Gramos",
      personalEmail: "brunildashperdhea@gmail.com",
      phone: "0685413934",
      orderId: 15,
      classId: 5 
    },
    { 
      firstName: "Daniel", 
      lastName: "Skënderaj", 
      institutionEmail: "dskenderaj@uet.edu.al", 
      father: "Fadil",
      personalEmail: "danielskenderaj606@gmail.com",
      phone: "0685376619",
      orderId: 16,
      classId: 5 
    },
    { 
      firstName: "Arvin", 
      lastName: "Xhelilaj", 
      institutionEmail: "axhelilaj3@uet.edu.al", 
      father: "Gentian",
      personalEmail: "xhelilajarvii28@gmail.com",
      phone: "0692251609",
      orderId: 17,
      classId: 5 
    },
    { 
      firstName: "Flavio", 
      lastName: "Zani", 
      institutionEmail: "fzani@uet.edu.al", 
      father: "Fatbardh",
      personalEmail: "flaviozani659@gmail.com",
      phone: "0659190740",
      orderId: 18,
      classId: 5 
    },
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
