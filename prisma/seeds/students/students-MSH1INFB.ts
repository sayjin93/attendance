import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedStudentsMSH1INFB() {
  console.log("🌱 Seeding students for MSH1INFB...");

  const studentsMSH1INFB = [
    {
      firstName: "Joana",
      father: "Niko",
      lastName: "Alliu",
      institutionEmail: "jalliu1@uet.edu.al",
      personalEmail: "joanaalliu9@gmail.com",
      phone: "684608160",
      orderId: 1,
      classId: 13
    },
    {
      firstName: "Stejsi",
      father: "Adhurim",
      lastName: "Bala",
      institutionEmail: "sbala7@uet.edu.al",
      personalEmail: "stejsi.bala@gmail.com",
      phone: "685169209",
      orderId: 2,
      classId: 13
    },
    {
      firstName: "Bora",
      father: "Armand",
      lastName: "Leola",
      institutionEmail: "lbora@uet.edu.al",
      personalEmail: "leola.bora2005@gmail.com",
      phone: "0693112244",
      orderId: 3,
      classId: 13,
      memo: "Punë"
    },
    {
      firstName: "Mateo",
      father: "Avni",
      lastName: "Dedolli",
      institutionEmail: "mdedolli3@uet.edu.al",
      personalEmail: "mateodedolli678@gmail.com",
      phone: "0699527307",
      orderId: 4,
      classId: 13
    },
    {
      firstName: "Xhesika",
      father: "Bardhyl",
      lastName: "Facja",
      institutionEmail: "xfacja@uet.edu.al",
      personalEmail: "xhesikafacja@gmail.com",
      phone: "0692729569",
      orderId: 5,
      classId: 13,
      memo: "Ref. Elton Dura"
    },
    {
      firstName: "Anisa",
      father: "Fredi",
      lastName: "Genica",
      institutionEmail: "agenica@uet.edu.al",
      personalEmail: "anisagenica03@gmail.com",
      phone: "0685684262",
      orderId: 6,
      classId: 13
    },
    {
      firstName: "Sadik",
      father: "Shkëlqim",
      lastName: "Gjana",
      institutionEmail: "sgjana2@uet.edu.al",
      personalEmail: "sadikgjana2000@icloud.com",
      phone: "0688763334",
      orderId: 7,
      classId: 13
    },
    {
      firstName: "Klajdi",
      father: "Besnik",
      lastName: "Gjuzi",
      institutionEmail: "kgjuzi3@uet.edu.al",
      personalEmail: "klajdgjuzi31@gmail.com",
      phone: "0684512031",
      orderId: 8,
      classId: 13
    },
    {
      firstName: "Ensild",
      father: "Lorenc",
      lastName: "Hallanjaku",
      institutionEmail: "ehallanjaku@uet.edu.al",
      personalEmail: "ensildhallanjaku2004@gmail.com",
      phone: "0675070115",
      orderId: 9,
      classId: 13
    },
    {
      firstName: "Kaltrina",
      father: "Leonard",
      lastName: "Hide",
      institutionEmail: "khide@uet.edu.al",
      personalEmail: "kaltrina.hide@gmail.com",
      phone: "0698646147",
      orderId: 10,
      classId: 13
    },
    {
      firstName: "Kris",
      father: "Admir",
      lastName: "Jenishaj",
      institutionEmail: "kjenishaj@uet.edu.al",
      personalEmail: "krisjenishaj.7@gmail.com",
      phone: "0688442736",
      orderId: 11,
      classId: 13
    },
    {
      firstName: "Ana",
      father: "Stefan",
      lastName: "Kaci",
      institutionEmail: "akaci6@uet.edu.al",
      personalEmail: "anakaci24@gmail.com",
      phone: "0695599385",
      orderId: 12,
      classId: 13
    },
    {
      firstName: "Enton",
      father: "Denis",
      lastName: "Kamata",
      institutionEmail: "ekamata@uet.edu.al",
      personalEmail: "entonbardhaj0002@gmail.com",
      phone: "0693733202",
      orderId: 13,
      classId: 13
    },
    {
      firstName: "Irikli",
      father: "Artan",
      lastName: "Karçini",
      institutionEmail: "ikarcini@uet.edu.al",
      personalEmail: "iriklitarcini@gmail.com",
      phone: "0693375758",
      orderId: 14,
      classId: 13
    },
    {
      firstName: "Paskuel",
      father: "Armando",
      lastName: "Katro",
      institutionEmail: "pkatro@uet.edu.al",
      personalEmail: "paskuel04katro@gmail.com",
      phone: "0699961001",
      orderId: 15,
      classId: 13
    },
    {
      firstName: "Armond",
      father: "Bujar",
      lastName: "Koloshi",
      institutionEmail: "akoloshi@uet.edu.al",
      personalEmail: "armondkoloshi93@gmail.com",
      phone: "0682934694",
      orderId: 16,
      classId: 13
    },
    {
      firstName: "Besmir",
      father: "Tajat",
      lastName: "Lamaj",
      institutionEmail: "b.lamaj@hotmail.com",
      personalEmail: "b.lamaj@hotmail.com",
      phone: "686066191",
      orderId: 17,
      classId: 13
    },
    {
      firstName: "Alkida",
      father: "Algend",
      lastName: "Lera",
      institutionEmail: "alera@uet.edu.al",
      personalEmail: "leraalkida@gmail.com",
      phone: "0692934929",
      orderId: 18,
      classId: 13
    },
    {
      firstName: "Selena",
      father: "Ektor",
      lastName: "Mehmet",
      institutionEmail: "smehmet@uet.edu.al",
      personalEmail: "mehmetselena08@gmail.com",
      phone: "692972770",
      orderId: 19,
      classId: 13
    },
    {
      firstName: "Renea",
      father: "Dhionis",
      lastName: "Musollari",
      institutionEmail: "rmusollari@uet.edu.al",
      personalEmail: "reneamusollari6@gmail.com",
      phone: "0675167122",
      orderId: 20,
      classId: 13
    },
    {
      firstName: "Endrit",
      father: "Fatos",
      lastName: "Mustafaj",
      institutionEmail: "emustafaj1@uet.edu.al",
      personalEmail: "endrit_mustafaj@outlook.com",
      phone: "0694615476",
      orderId: 21,
      classId: 13
    },
    {
      firstName: "Martina",
      father: "Ledi",
      lastName: "Necaj",
      institutionEmail: "mnecaj@uet.edu.al",
      personalEmail: "necajmartina@gmail.com",
      phone: "0692562739",
      orderId: 22,
      classId: 13
    },
    {
      firstName: "Kristina",
      father: "Vasil",
      lastName: "Niçaj",
      institutionEmail: "knicaj@uet.edu.al",
      personalEmail: "kristinanicaj19@gmail.com",
      phone: "0692072133",
      orderId: 23,
      classId: 13
    },
    {
      firstName: "Mateo",
      father: "Edmond",
      lastName: "Nushi",
      institutionEmail: "mnushi@uet.edu.al",
      personalEmail: "mateonushi565@gmail.com",
      phone: "0683185968",
      orderId: 24,
      classId: 13
    },
    {
      firstName: "Dea",
      father: "Amir",
      lastName: "Osmanaga",
      institutionEmail: "dosmanaga@uet.edu.al",
      personalEmail: "osmanagad@gmail.com",
      phone: "695444244",
      orderId: 25,
      classId: 13
    },
    {
      firstName: "Etna",
      father: "Behar",
      lastName: "Paja",
      institutionEmail: "epaja2@uet.edu.al",
      personalEmail: "pajaetna@gmail.com",
      phone: "0677109841",
      orderId: 26,
      classId: 13
    },
    {
      firstName: "Suljon",
      father: "Adrian",
      lastName: "Pashaj",
      institutionEmail: "spashaj@uet.edu.al",
      personalEmail: "pashajsuljon@gmail.com",
      phone: "0686747887",
      orderId: 27,
      classId: 13
    },
    {
      firstName: "Samona",
      father: "Sami",
      lastName: "Plaku",
      institutionEmail: "splaku@uet.edu.al",
      personalEmail: "samona.plaku91@yahoo.com",
      phone: "0683037137",
      orderId: 28,
      classId: 13
    },
    {
      firstName: "Aljon",
      father: "Artur",
      lastName: "Poçari",
      institutionEmail: "apocari@uet.edu.al",
      personalEmail: "aljonpocari0@gmail.com",
      phone: "0699731181",
      orderId: 29,
      classId: 13
    },
    {
      firstName: "Stefan",
      father: "Argjir",
      lastName: "Proko",
      institutionEmail: "sproko1@uet.edu.al",
      personalEmail: "stefanproko04@gmail.com",
      phone: "0692382347",
      orderId: 30,
      classId: 13
    },
    {
      firstName: "Fiona",
      father: "Kastriot",
      lastName: "Saliaj",
      institutionEmail: "fsaliaj1@uet.edu.al",
      personalEmail: "fionasaliaj01@gmail.com",
      phone: "0692098001",
      orderId: 31,
      classId: 13
    },
    {
      firstName: "Qazime",
      father: "Alket",
      lastName: "Seitaj",
      institutionEmail: "qseitaj@uet.edu.al",
      personalEmail: "erxhiseitaj1@icloud.com",
      phone: "0692539559",
      orderId: 32,
      classId: 13
    },
    {
      firstName: "Kristina",
      father: "Xhixhi",
      lastName: "Sekuj",
      institutionEmail: "ksekuj@uet.edu.al",
      personalEmail: "sekujkristi@gmail.com",
      phone: "0693433488",
      orderId: 33,
      classId: 13
    },
    {
      firstName: "Floralba",
      father: "Flamur",
      lastName: "Shehu",
      institutionEmail: "fshehu16@uet.edu.al",
      personalEmail: "florishehuu@gmail.com",
      phone: "0676742166",
      orderId: 34,
      classId: 13
    },
    {
      firstName: "Kevin",
      father: "Anesti",
      lastName: "Shëmbitraku",
      institutionEmail: "kshembitraku@uet.edu.al",
      personalEmail: "kevinshembitraku@gmail.com",
      phone: "0692707878",
      orderId: 35,
      classId: 13
    },
    {
      firstName: "Reina",
      father: "Jeno",
      lastName: "Sinaj",
      institutionEmail: "rsinaj@uet.edu.al",
      personalEmail: "reina.sinaj@gmail.com",
      phone: "0694170142",
      orderId: 36,
      classId: 13
    },
    {
      firstName: "Ivjon",
      father: "Ilir",
      lastName: "Subashi",
      institutionEmail: "isubashi3@uet.edu.al",
      personalEmail: "jonisubashi12@gmail.com",
      phone: "0693992898",
      orderId: 37,
      classId: 13
    },
    {
      firstName: "Alisja",
      father: "Shkëlqim",
      lastName: "Tafa",
      institutionEmail: "atafa@uet.edu.al",
      personalEmail: "tafaalisia@yahoo.com",
      phone: "0682273480",
      orderId: 38,
      classId: 13
    },
    {
      firstName: "Sivio",
      father: "Besnik",
      lastName: "Talelli",
      institutionEmail: "stalelli@uet.edu.al",
      personalEmail: "silviotalelli1@gmail.com",
      phone: "0697899396",
      orderId: 39,
      classId: 13
    },
    {
      firstName: "Jord",
      father: "Ilir",
      lastName: "Thanasi",
      institutionEmail: "jthanasi3@uet.edu.al",
      personalEmail: "jord.thanasi@gmail.com",
      phone: "0696441221",
      orderId: 40,
      classId: 13
    },
    {
      firstName: "Seira",
      father: "Sejni",
      lastName: "Thelbi",
      institutionEmail: "sthelbi@uet.edu.al",
      personalEmail: "ibrahimi@gmail.com",
      phone: "0692142697",
      orderId: 41,
      classId: 13
    },
    {
      firstName: "Enisa",
      father: "Mirvet",
      lastName: "Toçi",
      institutionEmail: "etoci3@uet.edu.al",
      personalEmail: "enisatoci2@gmail.com",
      phone: "0677154787",
      orderId: 42,
      classId: 13
    },
    {
      firstName: "Renato",
      father: "Qemal",
      lastName: "Vezi",
      institutionEmail: "rvezi@uet.edu.al",
      personalEmail: "vezirenato@gmail.com",
      phone: "0675669615",
      orderId: 43,
      classId: 13
    },
    {
      firstName: "Lorenca",
      father: "Lam",
      lastName: "Vokrri",
      institutionEmail: "lvokrri@uet.edu.al",
      personalEmail: "lorenca.v@icloud.com",
      phone: "0693438296",
      orderId: 44,
      classId: 13
    },
    {
      firstName: "Dea",
      father: "Agim",
      lastName: "Xhani",
      institutionEmail: "dxhani3@uet.edu.al",
      personalEmail: "dea.xhani@hotmail.com",
      phone: "0675552873",
      orderId: 45,
      classId: 13
    },
    {
      firstName: "Uendi",
      father: "Alban",
      lastName: "Zaimi",
      institutionEmail: "uzaimi@uet.edu.al",
      personalEmail: "uendizaimi@gmail.com",
      phone: "693185442",
      orderId: 46,
      classId: 13
    },
    {
      firstName: "Era",
      father: "Luan",
      lastName: "Zenelaj",
      institutionEmail: "ezenelaj@uet.edu.al",
      personalEmail: "erazenelaj06@gmail.com",
      phone: "0693535300",
      orderId: 47,
      classId: 13
    },
    {
      firstName: "Indrit",
      father: "Luan",
      lastName: "Zenelaj",
      institutionEmail: "izenelaj@uet.edu.al",
      personalEmail: "zenelajindrit@gmail.com",
      phone: "0698293333",
      orderId: 48,
      classId: 13
    }
  ];

  await prisma.student.createMany({
    data: studentsMSH1INFB,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1INFB.length} student(s) for MSH1INFB!`);
}

// Allow direct execution
if (require.main === module) {
  seedStudentsMSH1INFB()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error("❌ Error seeding students for MSH1INFB:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
