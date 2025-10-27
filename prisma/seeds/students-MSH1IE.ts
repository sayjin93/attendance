import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1IE() {
  console.log("🌱 Seeding students for MSH1IE...");

  const studentsMSH1IE = [
    { firstName: "Gerti", lastName: "Alimema", email: "galimema@uet.edu.al", classId: 11 },
    { firstName: "Hike", lastName: "Allamani", email: "hallamani@uet.edu.al", classId: 11 },
    { firstName: "Frenkli", lastName: "Bakalli", email: "fbakalli@uet.edu.al", classId: 11 },
    { firstName: "Denis", lastName: "Bendo", email: "dbendo@uet.edu.al", classId: 11 },
    { firstName: "Alden", lastName: "Bici", email: "abici5@uet.edu.al", classId: 11 },
    { firstName: "Meglis", lastName: "Brahusha", email: "mbrahusha@uet.edu.al", classId: 11 },
    { firstName: "Silva", lastName: "Ceni", email: "sceni@uet.edu.al", classId: 11 },
    { firstName: "Ani", lastName: "Ciko", email: "aciko@uet.edu.al", classId: 11 },
    { firstName: "Alesia", lastName: "Elezi", email: "aelezi13@uet.edu.al", classId: 11 },
    { firstName: "Enisa", lastName: "Gjokeja", email: "egjokeja@uet.edu.al", classId: 11 },
    { firstName: "Albi", lastName: "Hallulli", email: "ahallulli2@uet.edu.al", classId: 11 },
    { firstName: "Rei", lastName: "Hysa", email: "rhysa4@uet.edu.al", classId: 11 },
    { firstName: "Ema", lastName: "Hyso", email: "ehyso@uet.edu.al", classId: 11 },
    { firstName: "Jonela", lastName: "Jonuzaj", email: "jjonuzaj@uet.edu.al", classId: 11 },
    { firstName: "Anjeza", lastName: "Kaçorri", email: "akacorri1@uet.edu.al", classId: 11 },
    { firstName: "Markos", lastName: "Kadiu", email: "mkadiu5@uet.edu.al", classId: 11 },
    { firstName: "Aris", lastName: "Kallëmbi", email: "akallembi@uet.edu.al", classId: 11 },
    { firstName: "Klevis", lastName: "Kosiqi", email: "kkosiqi@uet.edu.al", classId: 11 },
    { firstName: "Mateo", lastName: "Lala", email: "mlala6@uet.edu.al", classId: 11 },
    { firstName: "Rexhino", lastName: "Latifi", email: "rlatifi@uet.edu.al", classId: 11 },
    { firstName: "Esmeraldo", lastName: "Mema", email: "emema21@uet.edu.al", classId: 11 },
    { firstName: "Erbi", lastName: "Muho", email: "emuho@uet.edu.al", classId: 11 },
    { firstName: "Xhevit", lastName: "Musagalliu", email: "xmusagalliu@uet.edu.al", classId: 11 },
    { firstName: "Kledis", lastName: "Sakollari", email: "ksakollari1@uet.edu.al", classId: 11 },
    { firstName: "Klejdi", lastName: "Shkurti", email: "kshkurti3@uet.edu.al", classId: 11 },
    { firstName: "Denisa", lastName: "Spahiu", email: "dspahiu3@uet.edu.al", classId: 11 },
    { firstName: "Herdi", lastName: "Sulaj", email: "hsulaj@uet.edu.al", classId: 11 },
    { firstName: "Gladiola", lastName: "Veseli", email: "gveseli5@uet.edu.al", classId: 11 },
    { firstName: "Albi", lastName: "Xhaho", email: "axhaho2@uet.edu.al", classId: 11 },
    { firstName: "Kristofor", lastName: "Zeqo", email: "kzeqo@uet.edu.al", classId: 11 },
    { firstName: "Eleni", lastName: "Zhollanji", email: "ezhollanji@uet.edu.al", classId: 11 },
  ];

  await prisma.student.createMany({
    data: studentsMSH1IE,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1IE.length} students for MSH1IE!`);
}

seedStudentsMSH1IE()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH1IE:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
