import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1INFA() {
  console.log("🌱 Seeding students for MSH1INFA...");

  const studentsMSH1INFA = [
    { firstName: "Mario", lastName: "Aleksi", email: "amario@uet.edu.al", classId: 12 },
    { firstName: "Keris", lastName: "Babliku", email: "kbabliku@uet.edu.al", classId: 12 },
    { firstName: "Rizart", lastName: "Belshaku", email: "rbelshaku@uet.edu.al", classId: 12 },
    { firstName: "Leticia", lastName: "Bitri", email: "lbitri@uet.edu.al", classId: 12 },
    { firstName: "Dorian", lastName: "Bozhiqi", email: "dbozhiqi@uet.edu.al", classId: 12 },
    { firstName: "Dorina", lastName: "Caka", email: "dcaka@uet.edu.al", classId: 12 },
    { firstName: "Kleidi", lastName: "Çurana", email: "kcurana@uet.edu.al", classId: 12 },
    { firstName: "Bajram", lastName: "Daci", email: "bdaci@uet.edu.al", classId: 12 },
    { firstName: "Suela", lastName: "Dajlani", email: "sdajlani@uet.edu.al", classId: 12 },
    { firstName: "Dajana", lastName: "Dariu", email: "ddariu@uet.edu.al", classId: 12 },
    { firstName: "Livia", lastName: "Demiri", email: "ldemiri@uet.edu.al", classId: 12 },
    { firstName: "Albin", lastName: "Feta", email: "afeta@uet.edu.al", classId: 12 },
    { firstName: "Besjona", lastName: "Gaba", email: "bgaba@uet.edu.al", classId: 12 },
    { firstName: "Rea", lastName: "Hida", email: "rhida@uet.edu.al", classId: 12 },
    { firstName: "Dhionisos", lastName: "Hoxha", email: "dhoxha@uet.edu.al", classId: 12 },
    { firstName: "Klaudio", lastName: "Hoxha", email: "khoxha@uet.edu.al", classId: 12 },
    { firstName: "Daniel", lastName: "Hidhra", email: "dhidhra@uet.edu.al", classId: 12 },
    { firstName: "Trevi", lastName: "Hysa", email: "thysa@uet.edu.al", classId: 12 },
    { firstName: "Kejsi", lastName: "Jahaj", email: "kjahaj@uet.edu.al", classId: 12 },
    { firstName: "Llambros", lastName: "Janko", email: "ljanko@uet.edu.al", classId: 12 },
    { firstName: "Albi", lastName: "Kaçaj", email: "kacaj@uet.edu.al", classId: 12 },
    { firstName: "Suela", lastName: "Kadiu", email: "skadiu@uet.edu.al", classId: 12 },
    { firstName: "Riza", lastName: "Kaja", email: "rkaja@uet.edu.al", classId: 12 },
    { firstName: "Riza", lastName: "Kaja", email: "rkaja@uet.edu.al", classId: 12 },
    { firstName: "Kelsi", lastName: "Kambo", email: "kkambo@uet.edu.al", classId: 12 },
    { firstName: "Migena", lastName: "Këri", email: "mkeri@uet.edu.al", classId: 12 },
    { firstName: "Kajdro", lastName: "Koconi", email: "kkoconi@uet.edu.al", classId: 12 },
    { firstName: "Erald", lastName: "Kola", email: "ekola@uet.edu.al", classId: 12 },
    { firstName: "Kjara", lastName: "Kolonja", email: "kkolonja@uet.edu.al", classId: 12 },
    { firstName: "Indrit", lastName: "Llamgozi", email: "illamgozi@uet.edu.al", classId: 12 },
    { firstName: "Henerik", lastName: "Lupi", email: "hlupi@uet.edu.al", classId: 12 },
    { firstName: "Megi", lastName: "Marku", email: "marku@uet.edu.al", classId: 12 },
    { firstName: "Ersilda", lastName: "Matoshi", email: "matoshi@uet.edu.al", classId: 12 },
    { firstName: "Merilda", lastName: "Zenelaj", email: "zenelaj@uet.edu.al", classId: 12 },
    { firstName: "Frenki", lastName: "Meta", email: "meta@uet.edu.al", classId: 12 },
    { firstName: "Samir", lastName: "Meta", email: "meta@uet.edu.al", classId: 12 },
    { firstName: "Fabian", lastName: "Muça", email: "fmuca@uet.edu.al", classId: 12 },
    { firstName: "Aleksandro", lastName: "Muceku", email: "amuceku@uet.edu.al", classId: 12 },
    { firstName: "Sindi", lastName: "Myrta", email: "smyrta@uet.edu.al", classId: 12 },
    { firstName: "Ornela", lastName: "Myrtaj", email: "omyrtaj@uet.edu.al", classId: 12 },
    { firstName: "Leandro", lastName: "Ndoj", email: "lndoj@uet.edu.al", classId: 12 },
    { firstName: "Adela", lastName: "Ndou", email: "andou@uet.edu.al", classId: 12 },
    { firstName: "Sara", lastName: "Paja", email: "spaja@uet.edu.al", classId: 12 },
    { firstName: "Ardi", lastName: "Qejvani", email: "qejvani@uet.edu.al", classId: 12 },
    { firstName: "Era", lastName: "Qirjaqi", email: "qirjaqi@uet.edu.al", classId: 12 },
    { firstName: "Jurgen", lastName: "Rade", email: "rade@uet.edu.al", classId: 12 },
    { firstName: "Aurora", lastName: "Reci", email: "reci@uet.edu.al", classId: 12 },
    { firstName: "Kejsi", lastName: "Reçi", email: "reçi@uet.edu.al", classId: 12 },
    { firstName: "Artisa", lastName: "Rexha", email: "arexha@uet.edu.al", classId: 12 },
    { firstName: "Klarida", lastName: "Rokaj", email: "krokaj@uet.edu.al", classId: 12 },
    { firstName: "Silvio", lastName: "Talelli", email: "stalelli@uet.edu.al", classId: 12 },
    { firstName: "Ekland", lastName: "Topçiu", email: "etopçiu@uet.edu.al", classId: 12 },
    { firstName: "Erisbiona", lastName: "Tutaj", email: "etutaj@uet.edu.al", classId: 12 },
    { firstName: "Kujtime", lastName: "Xhediku", email: "kxhediku@uet.edu.al", classId: 12 },
  ];

  await prisma.student.createMany({
    data: studentsMSH1INFA,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1INFA.length} student(s) for MSH1INFA!`);
}

seedStudentsMSH1INFA()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding students for MSH1INFA:", e);
    await prisma.$disconnect();
    process.exit(1);
  });