import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1INFB() {
  console.log("🌱 Seeding students for MSH1INFB...");

  const studentsMSH1INFB = [
    { firstName: "Stejsi", lastName: "Bala", email: "sbala@uet.edu.al", classId: 13 },
    { firstName: "Bora", lastName: "Leola", email: "bleola@uet.edu.al", classId: 13 },
    { firstName: "Mateo", lastName: "Dedolli", email: "mdedolli@uet.edu.al", classId: 13 },
    { firstName: "Xhesika", lastName: "Facja", email: "jfacja@uet.edu.al", classId: 13 },
    { firstName: "Anisa", lastName: "Genica", email: "agenica@uet.edu.al", classId: 13 },
    { firstName: "Sadik", lastName: "Gjana", email: "sgjana@uet.edu.al", classId: 13 },
    { firstName: "Klajdi", lastName: "Gjuzi", email: "kgjuzi@uet.edu.al", classId: 13 },
    { firstName: "Ensild", lastName: "Hallanjaku", email: "ehallanjaku@uet.edu.al", classId: 13 },
    { firstName: "Kaltrina", lastName: "Hide", email: "khide@uet.edu.al", classId: 13 },
    { firstName: "Kris", lastName: "Jenishaj", email: "kjenishaj@uet.edu.al", classId: 13 },
    { firstName: "Ana", lastName: "Kaci", email: "akaci@uet.edu.al", classId: 13 },
    { firstName: "Enton", lastName: "Kamata", email: "ekamata@uet.edu.al", classId: 13 },
    { firstName: "Irikli", lastName: "Karçini", email: "ikarcini@uet.edu.al", classId: 13 },
    { firstName: "Paskuel", lastName: "Katro", email: "pkatro@uet.edu.al", classId: 13 },
    { firstName: "Armond", lastName: "Koloshi", email: "akoloshi@uet.edu.al", classId: 13 },
    { firstName: "Alkida", lastName: "Lera", email: "alera@uet.edu.al", classId: 13 },
    { firstName: "Selena", lastName: "Mehmet", email: "smehmet@uet.edu.al", classId: 13 },
    { firstName: "Renea", lastName: "Musollari", email: "rmusollari@uet.edu.al", classId: 13 },
    { firstName: "Endrit", lastName: "Mustafaj", email: "emustafaj@uet.edu.al", classId: 13 },
    { firstName: "Martina", lastName: "Necaj", email: "mnecaj@uet.edu.al", classId: 13 },
    { firstName: "Mateo", lastName: "Nushi", email: "mnushi@uet.edu.al", classId: 13 },
    { firstName: "Dea", lastName: "Osmanaga", email: "dosmanaga@uet.edu.al", classId: 13 },
    { firstName: "Etna", lastName: "Paja", email: "epaja@uet.edu.al", classId: 13 },
    { firstName: "Suljon", lastName: "Pashaj", email: "spashaj@uet.edu.al", classId: 13 },
    { firstName: "Samona", lastName: "Plaku", email: "splaku@uet.edu.al", classId: 13 },
    { firstName: "Aljon", lastName: "Poçari", email: "apocari@uet.edu.al", classId: 13 },
    { firstName: "Stefan", lastName: "Proko", email: "sproko@uet.edu.al", classId: 13 },
    { firstName: "Fiona", lastName: "Saliaj", email: "fsaliaj@uet.edu.al", classId: 13 },
    { firstName: "Qazime", lastName: "Seitaj", email: "qseitaj@uet.edu.al", classId: 13 },
    { firstName: "Kristina", lastName: "Sekuj", email: "ksekuj@uet.edu.al", classId: 13 },
    { firstName: "Fjoralba", lastName: "Shehu", email: "fshehu@uet.edu.al", classId: 13 },
    { firstName: "Kevin", lastName: "Shembitraku", email: "kshembitraku@uet.edu.al", classId: 13 },
    { firstName: "Reina", lastName: "Sinaj", email: "rsinaj@uet.edu.al", classId: 13 },
    { firstName: "Armir", lastName: "Smajlaj", email: "asmailaj@uet.edu.al", classId: 13 },
    { firstName: "Ivjon", lastName: "Subashi", email: "isubashi@uet.edu.al", classId: 13 },
    { firstName: "Alisja", lastName: "Tafa", email: "atafa@uet.edu.al", classId: 13 },
    { firstName: "Jord", lastName: "Thanasi", email: "jthanasi@uet.edu.al", classId: 13 },
    { firstName: "Seira", lastName: "Thelbi", email: "sthelbi@uet.edu.al", classId: 13 },
    { firstName: "Enisa", lastName: "Toçi", email: "etoci@uet.edu.al", classId: 13 },
    { firstName: "Renato", lastName: "Vezi", email: "rvezi@uet.edu.al", classId: 13 },
    { firstName: "Lorenca", lastName: "Vokrri", email: "lvokrri@uet.edu.al", classId: 13 },
    { firstName: "Dea", lastName: "Xhani", email: "dxhani@uet.edu.al", classId: 13 },
    { firstName: "Era", lastName: "Zenelaj", email: "ezenelaj@uet.edu.al", classId: 13 },
    { firstName: "Indrit", lastName: "Zenelaj", email: "izenelaj@uet.edu.al", classId: 13 },
    { firstName: "Joana", lastName: "Alliu", email: "jalliu@uet.edu.al", classId: 13 },
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