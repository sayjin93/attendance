import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1TI() {
  console.log("🌱 Seeding students for MSH1TI...");

  const studentsMSH1TI = [
    { firstName: "Arlind", lastName: "Balla", institutionEmail: "aballa12@uet.edu.al", father: "Arjan", personalEmail: "ardiballa2@gmail.com", phone: "0684519752", orderId: 1, classId: 14 },
    { firstName: "Arbi", lastName: "Çangu", institutionEmail: "acangu@uet.edu.al", father: "Dashamir", personalEmail: "arbicangu179@gmail.com", phone: "0695553026", orderId: 2, classId: 14 },
    { firstName: "Geraldo", lastName: "Cela", institutionEmail: "gcela@uet.edu.al", father: "Lorenc", personalEmail: "gercelacela@gmail.com", phone: "0695348998", orderId: 3, classId: 14 },
    { firstName: "Griselda", lastName: "Cura", institutionEmail: "gcura@uet.edu.al", father: "Shpetim", personalEmail: "curagriselda65@gmail.com", phone: "0695722281, 0692108238", orderId: 4, classId: 14 },
    { firstName: "Ergita", lastName: "Curri", institutionEmail: "ecurri1@uet.edu.al", father: "Isuf", personalEmail: "curriergita@gmail.com", phone: "0686912409", orderId: 5, classId: 14 },
    { firstName: "Robert", lastName: "Feinaj", institutionEmail: "rfeinaj@uet.edu.al", father: "Kastriot", personalEmail: "robertfeinaj@gmail.com", phone: "0698612890", orderId: 6, classId: 14 },
    { firstName: "Bleona", lastName: "Gazulli", institutionEmail: "bgazulli2@uet.edu.al", father: "Sokol", personalEmail: "bleona.g27@icloud.com", phone: "0676875842", orderId: 7, classId: 14 },
    { firstName: "Ermal", lastName: "Imeraj", institutionEmail: "eimeraj10@uet.edu.al", father: "Çel", personalEmail: "imerajermal256@gmail.com", phone: "0694131856", orderId: 8, classId: 14 },
    { firstName: "Horges", lastName: "Kaca", institutionEmail: "hkaca1@uet.edu.al", father: "Ardian", personalEmail: "horgeskaca98@gmail.com", phone: "0677140743", orderId: 9, classId: 14 },
    { firstName: "Xhoalina", lastName: "Karasani", institutionEmail: "xkarasani@uet.edu.al", father: "Ethem", personalEmail: "karasani.xhoalina5@gmail.com", phone: "0683667185", orderId: 10, classId: 14 },
    { firstName: "Redjon", lastName: "Lleshaj", institutionEmail: "rlleshaj@uet.edu.al", father: "Gjovalin", personalEmail: "lleshajredjon@gmail.com", phone: "0675832629", orderId: 11, classId: 14 },
    { firstName: "Ergi", lastName: "Mankollari", institutionEmail: "emankollari@uet.edu.al", father: "Zamir", personalEmail: "ergimankollari1234@gmail.com", phone: "0699866105", orderId: 12, classId: 14 },
    { firstName: "Arsa", lastName: "Picari", institutionEmail: "apicari1@uet.edu.al", father: "Arben", personalEmail: "picariarsa@gmail.com", phone: "0697619021", orderId: 13, classId: 14 },
    { firstName: "Frenklin", lastName: "Saliasi", institutionEmail: "fsaliasi@uet.edu.al", father: "Arjan", personalEmail: "kenf1325@outlook.com", phone: "0692137665", orderId: 14, classId: 14 },
    { firstName: "Luiza", lastName: "Sula", institutionEmail: "lsula@uet.edu.al", father: "Jeran", personalEmail: "luizasula25@gmail.com", phone: "0698191107", orderId: 15, classId: 14 },
    { firstName: "Xhoilda", lastName: "Vuksanaj", institutionEmail: "xvuksanaj@uet.edu.al", father: "Gjovalin", personalEmail: "xhoilda.vuksanajj@gmail.com", phone: "0692359371", orderId: 16, classId: 14 },
    { firstName: "Endrit", lastName: "Zharri", institutionEmail: "ezharri@uet.edu.al", father: "Hamdi", personalEmail: "zharriendrit@gmail.com", phone: "0675350760", orderId: 17, classId: 14 },
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
