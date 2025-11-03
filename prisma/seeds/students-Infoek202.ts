import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsInfoek202() {
  console.log("🌱 Seeding students for Infoek202...");

  const studentsInfoek202 = [
    {
      firstName: "Gerald",
      father: "Artian",
      lastName: "Balla",
      institutionEmail: "gballa6@uet.edu.al",
      personalEmail: "geriballa4@gmail.com",
      phone: "0677275545",
      orderId: 1,
      classId: 8
    },
    {
      firstName: "Eldjon",
      father: "Juljan",
      lastName: "Beharaj",
      institutionEmail: "ebeharaj@uet.edu.al",
      personalEmail: "eldjonbeharaj1@gmail.com",
      phone: "0692159751",
      orderId: 2,
      classId: 8
    },
    {
      firstName: "Alesia",
      father: "Ilir",
      lastName: "Bufi",
      institutionEmail: "abufi2@uet.edu.al",
      personalEmail: "alesiabufi36@gmail.com",
      phone: "0695150047",
      orderId: 3,
      classId: 8
    },
    {
      firstName: "Esa",
      father: "Eduard",
      lastName: "Deliu",
      institutionEmail: "edeliu3@uet.edu.al",
      personalEmail: "esadeliu319@gmail.com",
      phone: "0693506851",
      orderId: 4,
      classId: 8
    },
    {
      firstName: "Juljan",
      father: "Fetah",
      lastName: "Deliu",
      institutionEmail: "jdeliu2@uet.edu.al",
      personalEmail: "deliujuli77@gmail.com",
      phone: "0695517620",
      orderId: 5,
      classId: 8
    },
    {
      firstName: "Eni",
      father: "Shkëlzen",
      lastName: "Dema",
      institutionEmail: "edema7@uet.edu.al",
      personalEmail: "enidema75@gmail.com",
      phone: "0683929494",
      orderId: 6,
      classId: 8
    },
    {
      firstName: "Fabian",
      father: "Zamir",
      lastName: "Ferhati",
      institutionEmail: "fferhati@uet.edu.al",
      personalEmail: "edlira.ferhati@gmail.com",
      phone: "0692422250",
      orderId: 7,
      classId: 8
    },
    {
      firstName: "Aqilea",
      father: "Dhimitraq",
      lastName: "Gaqos",
      institutionEmail: "agaqos@uet.edu.al",
      personalEmail: "aqileagaqos@gmail.com",
      phone: "0695548222",
      orderId: 8,
      classId: 8
    },
    {
      firstName: "Marjela",
      father: "Vladimir",
      lastName: "Gjeloshaj",
      institutionEmail: "mgjeloshaj@uet.edu.al",
      personalEmail: "gj.marjela05@gmail.com",
      phone: "0696602880",
      orderId: 9,
      classId: 8
    },
    {
      firstName: "Lorenzo",
      father: "Françesko",
      lastName: "Gjeloshi",
      institutionEmail: "lgjeloshi@uet.edu.al",
      personalEmail: "lorenzogjeloshi277@gmail.com",
      phone: "0688409162",
      orderId: 10,
      classId: 8
    },
    {
      firstName: "Vanesa",
      father: "Dashmir",
      lastName: "Gjika",
      institutionEmail: "vgjika2@uet.edu.al",
      personalEmail: "vanesagjika@icloud.com",
      phone: "0682151458",
      orderId: 11,
      classId: 8
    },
    {
      firstName: "Anisa",
      father: "Fredi",
      lastName: "Hajdari",
      institutionEmail: "ahajdari8@uet.edu.al",
      personalEmail: "anisahajdari@gmail.com",
      phone: "0695312510",
      orderId: 12,
      classId: 8
    },
    {
      firstName: "Mario",
      father: "Romeo",
      lastName: "Hajderdhi",
      institutionEmail: "mhajderdhi@uet.edu.al",
      personalEmail: "mhajderdhi@gmail.com",
      phone: "0698609906",
      orderId: 13,
      classId: 8
    },
    {
      firstName: "Ronela",
      father: "Alket",
      lastName: "Hoxha",
      institutionEmail: "rhoxha24@uet.edu.al",
      personalEmail: "ronelahoxha2006@gmail.com",
      phone: "0694448127",
      orderId: 14,
      classId: 8
    },
    {
      firstName: "Klea Joana",
      father: "Viktor",
      lastName: "Kodhelaj",
      institutionEmail: "kkodhelaj@uet.edu.al",
      personalEmail: "kleakodhelaj@gmail.com",
      phone: "0693206289",
      orderId: 15,
      classId: 8
    },
    {
      firstName: "Klajdi",
      father: "Blendi",
      lastName: "Kola",
      institutionEmail: "kkola10@uet.edu.al",
      personalEmail: "lidakola746@gmail.com",
      phone: "0694536022",
      orderId: 16,
      classId: 8
    },
    {
      firstName: "Sevastianos",
      father: "Xhaferr",
      lastName: "Korreshi",
      institutionEmail: "skorreshi@uet.edu.al",
      personalEmail: "sebikorreshi@gmail.com",
      phone: "0695233836",
      orderId: 17,
      classId: 8
    },
    {
      firstName: "Kristjen",
      father: "Kliton",
      lastName: "Kurti",
      institutionEmail: "kkurti9@uet.edu.al",
      personalEmail: "kristjenkurti1@gmail.com",
      phone: "0693967482",
      orderId: 18,
      classId: 8
    },
    {
      firstName: "Skender",
      father: "Ilir",
      lastName: "Muçka",
      institutionEmail: "smucka2@uet.edu.al",
      personalEmail: "nerimucka@icloud.com",
      phone: "0696202143",
      orderId: 19,
      classId: 8
    },
    {
      firstName: "Asel",
      father: "Leonarh",
      lastName: "Nela",
      institutionEmail: "anela2@uet.edu.al",
      personalEmail: "aselnela05@hotmail.com",
      phone: "0692323186",
      orderId: 20,
      classId: 8
    },
    {
      firstName: "Almedina",
      father: "Astrit",
      lastName: "Piranaj",
      institutionEmail: "apiranaj2@uet.edu.al",
      personalEmail: "almedina.piranaj@gmail.com",
      phone: "0677105815",
      orderId: 21,
      classId: 8
    },
    {
      firstName: "Albiona",
      father: "Fatmir",
      lastName: "Qinami",
      institutionEmail: "aqinami6@uet.edu.al",
      personalEmail: "albionaqinami@gmail.com",
      phone: "0683208132",
      orderId: 22,
      classId: 8
    },
    {
      firstName: "Selma",
      father: "Gentian",
      lastName: "Qoku",
      institutionEmail: "sqoku@uet.edu.al",
      personalEmail: "selmaqoku9@gmail.com",
      phone: "0696964438",
      orderId: 23,
      classId: 8
    },
    {
      firstName: "Erjon",
      father: "Ilir",
      lastName: "Rira",
      institutionEmail: "erira4@uet.edu.al",
      personalEmail: "erjonrira@gmail.com",
      phone: "0677333641",
      orderId: 24,
      classId: 8
    },
    {
      firstName: "Amelja",
      father: "Ilir",
      lastName: "Rrapaj",
      institutionEmail: "arrapaj@uet.edu.al",
      personalEmail: "sararrapaj@hotmail.com",
      phone: "0694625377",
      orderId: 25,
      classId: 8
    },
    {
      firstName: "Erisa",
      father: "Lavderim",
      lastName: "Sadikaj",
      institutionEmail: "esadikaj4@uet.edu.al",
      personalEmail: "erisasadikaj10@gmail.com",
      phone: "0693431603",
      orderId: 26,
      classId: 8
    },
    {
      firstName: "Ertugel",
      father: "Ilirjan",
      lastName: "Saliaj",
      institutionEmail: "esaliaj11@uet.edu.al",
      personalEmail: "ertugelsaliaj04@gmail.com",
      phone: "0684782400",
      orderId: 27,
      classId: 8
    },
    {
      firstName: "Sara",
      father: "Kastriot",
      lastName: "Shehu",
      institutionEmail: "sshehu16@uet.edu.al",
      personalEmail: "sarashehu1329@gmail.com",
      phone: "0682936354",
      orderId: 28,
      classId: 8
    },
    {
      firstName: "Justin",
      father: "Elmond",
      lastName: "Shtëpani",
      institutionEmail: "jshtepani@uet.edu.al",
      personalEmail: "jshtepani@icloud.com",
      phone: "0688262456",
      orderId: 29,
      classId: 8
    },
    {
      firstName: "Amela",
      father: "Nimet",
      lastName: "Subashaj",
      institutionEmail: "asubashaj@uet.edu.al",
      personalEmail: "amelasubashaj@gmail.com",
      phone: "0694778875",
      orderId: 30,
      classId: 8
    },
    {
      firstName: "Alesjo",
      father: "Shazivar",
      lastName: "Sula",
      institutionEmail: "asula17@uet.edu.al",
      personalEmail: "alesjosula5@gmail.com",
      phone: "0684492437",
      orderId: 31,
      classId: 8
    },
    {
      firstName: "Olta",
      father: "Roland",
      lastName: "Xhardo",
      institutionEmail: "oxhardo@uet.edu.al",
      personalEmail: "oltaxhardo9@gmail.com",
      phone: "0692896381",
      orderId: 32,
      classId: 8
    },
    {
      firstName: "Detjon",
      father: "Petrit",
      lastName: "Xhepi",
      institutionEmail: "dxhepi@uet.edu.al",
      personalEmail: "detjonxhepi@gmail.com",
      phone: "0695570300",
      orderId: 33,
      classId: 8
    },
    {
      firstName: "Klea",
      father: "Afrim",
      lastName: "Zhaboli",
      institutionEmail: "kzhaboli@uet.edu.al",
      personalEmail: "kleazhaboli@gmail.com",
      phone: "0676665877",
      orderId: 34,
      classId: 8
    }
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
