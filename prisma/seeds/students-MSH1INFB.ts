import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1INFB() {
  console.log("🌱 Seeding students for MSH1INFB...");

  const studentsMSH1INFB = [
    { firstName: "Joana", lastName: "Alliu", institutionEmail: "jalliu1@uet.edu.al", father: "Niko", personalEmail: "joanaalliu9@gmail.com", phone: "684608160", orderId: 1, classId: 13 },
    { firstName: "Stejsi", lastName: "Bala", institutionEmail: "sbala7@uet.edu.al", father: "Adhurim", personalEmail: "stejsi.bala@gmail.com", phone: "685169209", orderId: 2, classId: 13 },
    { firstName: "Bora", lastName: "Leola", institutionEmail: "lbora@uet.edu.al", father: "Armand", personalEmail: "leola.bora2005@gmail.com", phone: "0693112244", orderId: 3, classId: 13 },
    { firstName: "Mateo", lastName: "Dedolli", institutionEmail: "mdedolli3@uet.edu.al", father: "Avni", personalEmail: "mateodedolli678@gmail.com", phone: "0699527307", orderId: 4, classId: 13 },
    { firstName: "Xhesika", lastName: "Facja", institutionEmail: "xfacja@uet.edu.al", father: "Bardhyl", personalEmail: "xhesikafacja@gmail.com", phone: "0692729569", orderId: 5, classId: 13 },
    { firstName: "Anisa", lastName: "Genica", institutionEmail: "agenica@uet.edu.al", father: "Fredi", personalEmail: "anisagenica03@gmail.com", phone: "0685684262", orderId: 6, classId: 13 },
    { firstName: "Sadik", lastName: "Gjana", institutionEmail: "sgjana2@uet.edu.al", father: "Shkëlqim", personalEmail: "sadikgjana2000@icloud.com", phone: "0688763334", orderId: 7, classId: 13 },
    { firstName: "Klajdi", lastName: "Gjuzi", institutionEmail: "kgjuzi3@uet.edu.al", father: "Besnik", personalEmail: "klajdgjuzi31@gmail.com", phone: "0684512031", orderId: 8, classId: 13 },
    { firstName: "Ensild", lastName: "Hallanjaku", institutionEmail: "ehallanjaku@uet.edu.al", father: "Lorenc", personalEmail: "ensildhallanjaku2004@gmail.com", phone: "0675070115", orderId: 9, classId: 13 },
    { firstName: "Kaltrina", lastName: "Hide", institutionEmail: "khide@uet.edu.al", father: "Leonard", personalEmail: "kaltrina.hide@gmail.com", phone: "0698646147", orderId: 10, classId: 13 },
    { firstName: "Kris", lastName: "Jenishaj", institutionEmail: "kjenishaj@uet.edu.al", father: "Admir", personalEmail: "krisjenishaj.7@gmail.com", phone: "0688442736", orderId: 11, classId: 13 },
    { firstName: "Ana", lastName: "Kaci", institutionEmail: "akaci6@uet.edu.al", father: "Stefan", personalEmail: "anakaci24@gmail.com", phone: "0695599385", orderId: 12, classId: 13 },
    { firstName: "Enton", lastName: "Kamata", institutionEmail: "ekamata@uet.edu.al", father: "Denis", personalEmail: "entonbardhaj0002@gmail.com", phone: "0693733202", orderId: 13, classId: 13 },
    { firstName: "Irikli", lastName: "Karçini", institutionEmail: "ikarcini@uet.edu.al", father: "Artan", personalEmail: "iriklitarcini@gmail.com", phone: "0693375758", orderId: 14, classId: 13 },
    { firstName: "Paskuel", lastName: "Katro", institutionEmail: "pkatro@uet.edu.al", father: "Armando", personalEmail: "paskuel04katro@gmail.com", phone: "0699961001", orderId: 15, classId: 13 },
    { firstName: "Armond", lastName: "Koloshi", institutionEmail: "akoloshi@uet.edu.al", father: "Bujar", personalEmail: "armondkoloshi93@gmail.com", phone: "0682934694", orderId: 16, classId: 13 },
    { firstName: "Besmir", lastName: "Lamaj", institutionEmail: "b.lamaj@hotmail.com", father: "Tajat", personalEmail: "b.lamaj@hotmail.com", phone: "686066191", orderId: 17, classId: 13 },
    { firstName: "Alkida", lastName: "Lera", institutionEmail: "alera@uet.edu.al", father: "Algend", personalEmail: "leraalkida@gmail.com", phone: "0692934929", orderId: 18, classId: 13 },
    { firstName: "Selena", lastName: "Mehmet", institutionEmail: "smehmet@uet.edu.al", father: "Ektor", personalEmail: "mehmetselena08@gmail.com", phone: "692972770", orderId: 19, classId: 13 },
    { firstName: "Renea", lastName: "Musollari", institutionEmail: "rmusollari@uet.edu.al", father: "Dhionis", personalEmail: "reneamusollari6@gmail.com", phone: "0675167122", orderId: 20, classId: 13 },
    { firstName: "Endrit", lastName: "Mustafaj", institutionEmail: "emustafaj1@uet.edu.al", father: "Fatos", personalEmail: "endrit_mustafaj@outlook.com", phone: "0694615476", orderId: 21, classId: 13 },
    { firstName: "Martina", lastName: "Necaj", institutionEmail: "mnecaj@uet.edu.al", father: "Ledi", personalEmail: "necajmartina@gmail.com", phone: "0692562739", orderId: 22, classId: 13 },
    { firstName: "Kristina", lastName: "Nicaj", institutionEmail: "knicaj@uet.edu.al", father: "Vasil", personalEmail: "kristinanicaj19@gmail.com", phone: "0692072133", orderId: 23, classId: 13 },
    { firstName: "Mateo", lastName: "Nushi", institutionEmail: "mnushi@uet.edu.al", father: "Edmond", personalEmail: "mateonushi565@gmail.com", phone: "0683185968", orderId: 24, classId: 13 },
    { firstName: "Dea", lastName: "Osmanaga", institutionEmail: "dosmanaga@uet.edu.al", father: "Amir", personalEmail: "osmanagad@gmail.com", phone: "695444244", orderId: 25, classId: 13 },
    { firstName: "Etna", lastName: "Paja", institutionEmail: "epaja2@uet.edu.al", father: "Behar", personalEmail: "pajaetna@gmail.com", phone: "0677109841", orderId: 26, classId: 13 },
    { firstName: "Suljon", lastName: "Pashaj", institutionEmail: "spashaj@uet.edu.al", father: "Adrian", personalEmail: "pashajsuljon@gmail.com", phone: "0686747887", orderId: 27, classId: 13 },
    { firstName: "Samona", lastName: "Plaku", institutionEmail: "splaku@uet.edu.al", father: "Sami", personalEmail: "samona.plaku91@yahoo.com", phone: "0683037137", orderId: 28, classId: 13 },
    { firstName: "Aljon", lastName: "Pocari", institutionEmail: "apocari@uet.edu.al", father: "Artur", personalEmail: "aljonpocari0@gmail.com", phone: "0699731181", orderId: 29, classId: 13 },
    { firstName: "Stefan", lastName: "Proko", institutionEmail: "sproko1@uet.edu.al", father: "Argjir", personalEmail: "stefanproko04@gmail.com", phone: "0692382347", orderId: 30, classId: 13 },
    { firstName: "Fiona", lastName: "Saliaj", institutionEmail: "fsaliaj1@uet.edu.al", father: "Kastriot", personalEmail: "fionasaliaj01@gmail.com", phone: "0692098001", orderId: 31, classId: 13 },
    { firstName: "Qazime", lastName: "Seitaj", institutionEmail: "qseitaj@uet.edu.al", father: "Alket", personalEmail: "erxhiseitaj1@icloud.com", phone: "0692539559", orderId: 32, classId: 13 },
    { firstName: "Kristina", lastName: "Sekuj", institutionEmail: "ksekuj@uet.edu.al", father: "Xhixhi", personalEmail: "sekujkristi@gmail.com", phone: "0693433488", orderId: 33, classId: 13 },
    { firstName: "Floralba", lastName: "Shehu", institutionEmail: "fshehu16@uet.edu.al", father: "Flamur", personalEmail: "florishehuu@gmail.com", phone: "0676742166", orderId: 34, classId: 13 },
    { firstName: "Kevin", lastName: "Shembitraku", institutionEmail: "kshembitraku@uet.edu.al", father: "Anesti", personalEmail: "kevinshembitraku@gmail.com", phone: "0692707878", orderId: 35, classId: 13 },
    { firstName: "Reina", lastName: "Sinaj", institutionEmail: "rsinaj@uet.edu.al", father: "Jeno", personalEmail: "reina.sinaj@gmail.com", phone: "0694170142", orderId: 36, classId: 13 },
    { firstName: "Armir", lastName: "Smajlaj", institutionEmail: "asmajlaj3@uet.edu.al", father: "Behar", personalEmail: "smajlajarmir@gmail.com", phone: "0695306744", orderId: 37, classId: 13 },
    { firstName: "Ivion", lastName: "Subashi", institutionEmail: "isubashi3@uet.edu.al", father: "Ilir", personalEmail: "jonisubashi12@gmail.com", phone: "0693992898", orderId: 38, classId: 13 },
    { firstName: "Alisia", lastName: "Tafa", institutionEmail: "atafa@uet.edu.al", father: "Shkëlqim", personalEmail: "tafaalisia@yahoo.com", phone: "0682273480", orderId: 39, classId: 13 },
    { firstName: "Jord", lastName: "Thanasi", institutionEmail: "jthanasi3@uet.edu.al", father: "Ilir", personalEmail: "jord.thanasi@gmail.com", phone: "0696441221", orderId: 40, classId: 13 },
    { firstName: "Seira", lastName: "Thelbi", institutionEmail: "sthelbi@uet.edu.al", father: "Sejni", personalEmail: "ibrahimi@gmail.com", phone: "0692142697", orderId: 41, classId: 13 },
    { firstName: "Enisa", lastName: "Toci", institutionEmail: "etoci3@uet.edu.al", father: "Mirvet", personalEmail: "enisatoci2@gmail.com", phone: "0677154787", orderId: 42, classId: 13 },
    { firstName: "Renato", lastName: "Vezi", institutionEmail: "rvezi@uet.edu.al", father: "Qemal", personalEmail: "vezirenato@gmail.com", phone: "0675669615", orderId: 43, classId: 13 },
    { firstName: "Lorenca", lastName: "Vokrri", institutionEmail: "lvokrri@uet.edu.al", father: "Lam", personalEmail: "lorenca.v@icloud.com", phone: "0693438296", orderId: 44, classId: 13 },
    { firstName: "Dea", lastName: "Xhani", institutionEmail: "dxhani3@uet.edu.al", father: "Agim", personalEmail: "dea.xhani@hotmail.com", phone: "0675552873, 694513599", orderId: 45, classId: 13 },
    { firstName: "Uendi", lastName: "Zaimi", institutionEmail: "uzaimi@uet.edu.al", father: "Alban", personalEmail: "uendizaimi@gmail.com", phone: "693185442", orderId: 46, classId: 13 },
    { firstName: "Era", lastName: "Zenelaj", institutionEmail: "ezenelaj@uet.edu.al", father: "Luan", personalEmail: "erazenelaj06@gmail.com", phone: "0693535300", orderId: 47, classId: 13 },
    { firstName: "Indrit", lastName: "Zenelaj", institutionEmail: "izenelaj@uet.edu.al", father: "Luan", personalEmail: "zenelajindrit@gmail.com", phone: "0698293333", orderId: 48, classId: 13 },
  ];

  await prisma.student.createMany({
    data: studentsMSH1INFB,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1INFB.length} student(s) for MSH1INFB!`);
}

seedStudentsMSH1INFB()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH1INFB:", e);
    await prisma.$disconnect();
    process.exit(1);
  });