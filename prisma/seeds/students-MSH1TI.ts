import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1TI() {
  console.log("🌱 Seeding students for MSH1TI...");

  const studentsMSH1TI = [
    {
      firstName: "Arlind",
      father: "Arjan",
      lastName: "Balla",
      institutionEmail: "aballa12@uet.edu.al",
      personalEmail: "ardiballa2@gmail.com",
      phone: "0684519752",
      orderId: 1,
      classId: 14
    },
    {
      firstName: "Arbi",
      father: "Dashamir",
      lastName: "Çangu",
      institutionEmail: "acangu@uet.edu.al",
      personalEmail: "arbicangu179@gmail.com",
      phone: "0695553026",
      orderId: 2,
      classId: 14
    },
    {
      firstName: "Geraldo",
      father: "Lorenc",
      lastName: "Cela",
      institutionEmail: "gcela@uet.edu.al",
      personalEmail: "gercelacela@gmail.com",
      phone: "0695348998",
      orderId: 3,
      classId: 14
    },
    {
      firstName: "Griselda",
      father: "Shpetim",
      lastName: "Cura",
      institutionEmail: "gcura@uet.edu.al",
      personalEmail: "curagriselda65@gmail.com",
      phone: "0695722281",
      orderId: 4,
      classId: 14
    },
    {
      firstName: "Ergita",
      father: "Isuf",
      lastName: "Curri",
      institutionEmail: "ecurri1@uet.edu.al",
      personalEmail: "curriergita@gmail.com",
      phone: "0686912409",
      orderId: 5,
      classId: 14
    },
    {
      firstName: "Robert",
      father: "Kastriot",
      lastName: "Feinaj",
      institutionEmail: "rfeinaj@uet.edu.al",
      personalEmail: "robertfeinaj@gmail.com",
      phone: "0698612890",
      orderId: 6,
      classId: 14
    },
    {
      firstName: "Bleona",
      father: "Sokol",
      lastName: "Gazulli",
      institutionEmail: "bgazulli2@uet.edu.al",
      personalEmail: "bleona.g27@icloud.com",
      phone: "0676875842",
      orderId: 7,
      classId: 14
    },
    {
      firstName: "Ermal",
      father: "Çel",
      lastName: "Imeraj",
      institutionEmail: "eimeraj10@uet.edu.al",
      personalEmail: "imerajermal256@gmail.com",
      phone: "0694131856",
      orderId: 8,
      classId: 14
    },
    {
      firstName: "Horges",
      father: "Ardian",
      lastName: "Kaca",
      institutionEmail: "hkaca1@uet.edu.al",
      personalEmail: "horgeskaca98@gmail.com",
      phone: "0677140743",
      orderId: 9,
      classId: 14
    },
    {
      firstName: "Xhoalina",
      father: "Ethem",
      lastName: "Karasani",
      institutionEmail: "xkarasani@uet.edu.al",
      personalEmail: "karasani.xhoalina5@gmail.com",
      phone: "0683667185",
      orderId: 10,
      classId: 14
    },
    {
      firstName: "Redjon",
      father: "Gjovalin",
      lastName: "Lleshaj",
      institutionEmail: "rlleshaj@uet.edu.al",
      personalEmail: "lleshajredjon@gmail.com",
      phone: "0675832629",
      orderId: 11,
      classId: 14
    },
    {
      firstName: "Ergi",
      father: "Zamir",
      lastName: "Mankollari",
      institutionEmail: "emankollari@uet.edu.al",
      personalEmail: "ergimankollari1234@gmail.com",
      phone: "0699866105",
      orderId: 12,
      classId: 14
    },
    {
      firstName: "Arsa",
      father: "Arben",
      lastName: "Picari",
      institutionEmail: "apicari1@uet.edu.al",
      personalEmail: "picariarsa@gmail.com",
      phone: "0697619021",
      orderId: 13,
      classId: 14
    },
    {
      firstName: "Frenklin",
      father: "Arjan",
      lastName: "Saliasi",
      institutionEmail: "fsaliasi@uet.edu.al",
      personalEmail: "kenf1325@outlook.com",
      phone: "0692137665",
      orderId: 14,
      classId: 14
    },
    {
      firstName: "Luiza",
      father: "Jeran",
      lastName: "Sula",
      institutionEmail: "lsula@uet.edu.al",
      personalEmail: "luizasula25@gmail.com",
      phone: "0698191107",
      orderId: 15,
      classId: 14
    },
    {
      firstName: "Xhoilda",
      father: "Gjovalin",
      lastName: "Vuksanaj",
      institutionEmail: "xvuksanaj@uet.edu.al",
      personalEmail: "xhoilda.vuksanajj@gmail.com",
      phone: "0692359371",
      orderId: 16,
      classId: 14
    },
    {
      firstName: "Endrit",
      father: "Hamdi",
      lastName: "Zharri",
      institutionEmail: "ezharri@uet.edu.al",
      personalEmail: "zharriendrit@gmail.com",
      phone: "0675350760",
      orderId: 17,
      classId: 14
    }
  ];

  await prisma.student.createMany({
    data: studentsMSH1TI,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1TI.length} students for MSH1TI!`);
}

seedStudentsMSH1TI()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH1TI:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
