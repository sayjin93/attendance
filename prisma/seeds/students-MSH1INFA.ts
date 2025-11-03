import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsMSH1INFA() {
  console.log("🌱 Seeding students for MSH1INFA...");

  const studentsMSH1INFA = [
    { firstName: "Mario", lastName: "Aleksi", institutionEmail: "maleksi2@uet.edu.al", father: "Trifon", personalEmail: "marioaleksi@yahoo.com", phone: "0692869268", orderId: 1, classId: 12 },
    { firstName: "Keris", lastName: "Babliku", institutionEmail: "kbabliku@uet.edu.al", father: "Piro", personalEmail: "kerisbabliku39@gmail.com", phone: "0693528404", orderId: 2, classId: 12 },
    { firstName: "Rizart", lastName: "Belshaku", institutionEmail: "rbelshaku@uet.edu.al", father: "Selman", personalEmail: "rizartbelshaku2@gmail.com", phone: "0692932128", orderId: 3, classId: 12 },
    { firstName: "Leticia", lastName: "Bitri", institutionEmail: "lbitri@uet.edu.al", father: "Ilirian", personalEmail: "leticiabitri@icloud.com", phone: "676314783", orderId: 4, classId: 12 },
    { firstName: "Dorian", lastName: "Bozhiqi", institutionEmail: "dbozhiqi@uet.edu.al", father: "Asllan", personalEmail: "doridori608@gmail.com", phone: "0698725402, 698725402", orderId: 5, classId: 12 },
    { firstName: "Dorina", lastName: "Caka", institutionEmail: "dcaka2@uet.edu.al", father: "Altin", personalEmail: "dorinacaka2003@gmail.com, ariolacaka14@gmail.com", phone: "0683884210", orderId: 6, classId: 12 },
    { firstName: "Kleidi", lastName: "Çurana", institutionEmail: "kcurana@uet.edu.al", father: "Albert", personalEmail: "curanakleidi@gmail.com", phone: "0683338009", orderId: 7, classId: 12 },
    { firstName: "Bajram", lastName: "Daci", institutionEmail: "bdaci3@uet.edu.al", father: "Haxhi", personalEmail: "lamio.daci@pm.me", phone: "0686514600", orderId: 8, classId: 12 },
    { firstName: "Suela", lastName: "Dajlani", institutionEmail: "sdajlani@uet.edu.al", father: "Sokol", personalEmail: "sueela29@gmail.com", phone: "0684308550", orderId: 9, classId: 12 },
    { firstName: "Dajana", lastName: "Dariu", institutionEmail: "ddariu@uet.edu.al", father: "Pellumb", personalEmail: "dajanadariu21@gmail.com", phone: "0694204827", orderId: 10, classId: 12 },
    { firstName: "Livia", lastName: "Demiri", institutionEmail: "ldemiri1@uet.edu.al", father: "Artur", personalEmail: "liviademiri24@gmail.com", phone: "0687915733", orderId: 11, classId: 12 },
    { firstName: "Albin", lastName: "Feta", institutionEmail: "afeta3@uet.edu.al", father: "Afrim", personalEmail: "1011feta@gmail.com", phone: "675601740", orderId: 12, classId: 12 },
    { firstName: "Besjona", lastName: "Gaba", institutionEmail: "bgaba1@uet.edu.al", father: "Bahir", personalEmail: "besjona2016@gmail.com", phone: "693465500", orderId: 13, classId: 12 },
    { firstName: "Rea", lastName: "Hida", institutionEmail: "rhida2@uet.edu.al", father: "Arben", personalEmail: "reahidaa@gmail.com", phone: "0682781295", orderId: 14, classId: 12 },
    { firstName: "Dhionisos", lastName: "Hoxha", institutionEmail: "dhoxha28@uet.edu.al", father: "Erjon", personalEmail: "dionyshoxha@gmail.com", phone: "0694662301", orderId: 15, classId: 12 },
    { firstName: "Klaudio", lastName: "Hoxha", institutionEmail: "khoxha24@uet.edu.al", father: "Arjan", personalEmail: "hklaudio4@gmail.com", phone: "0688257550", orderId: 16, classId: 12 },
    { firstName: "Daniel", lastName: "Hudhra", institutionEmail: "dhudhra@uet.edu.al", father: "Thimi", personalEmail: "daniel.hudhra@gmail.com", phone: "0682156483", orderId: 17, classId: 12 },
    { firstName: "Trevi", lastName: "Hysa", institutionEmail: "thysa@uet.edu.al", father: "Edmond", personalEmail: "hysatrevi@gmai.com", phone: "0683234555", orderId: 18, classId: 12 },
    { firstName: "Kejsi", lastName: "Jahaj", institutionEmail: "kjahaj3@uet.edu.al", father: "Bleritn", personalEmail: "kejsijahaj95@gmail.com", phone: "0693990816", orderId: 19, classId: 12 },
    { firstName: "Llambros", lastName: "Janko", institutionEmail: "ljanko3@uet.edu.al", father: "Altin", personalEmail: "llambrosjanko13@gmail.com", phone: "0685212006", orderId: 20, classId: 12 },
    { firstName: "Albi", lastName: "Kaçaj", institutionEmail: "akacaj@uet.edu.al", father: "Latif", personalEmail: "albikaci75@gmail.com", phone: "0699982662", orderId: 21, classId: 12 },
    { firstName: "Suela", lastName: "Kadiu", institutionEmail: "skadiu@uet.edu.al", father: "Shefki", personalEmail: "suelakadiu03@gmail.com", phone: "0683702062", orderId: 22, classId: 12 },
    { firstName: "Riza", lastName: "Kaja", institutionEmail: "rkaja@uet.edu.al", father: "Artur", personalEmail: "rizakaja@yahoo.com", phone: "677307635", orderId: 23, classId: 12 },
    { firstName: "Kelsi", lastName: "Kambo", institutionEmail: "kkambo@uet.edu.al", father: "Bexhet", personalEmail: "kelsikelsi737@gmail.com", phone: "0673949740", orderId: 24, classId: 12 },
    { firstName: "Migena", lastName: "Këri", institutionEmail: "mkeri@uet.edu.al", father: "Elidon", personalEmail: "migenakeri911@gmail.com", phone: "0694661027", orderId: 25, classId: 12 },
    { firstName: "Kajdro", lastName: "Koconi", institutionEmail: "kkoconi@uet.edu.al", father: "Lonidha", personalEmail: "kajdrokoconi12@gmail.com", phone: "0695756455", orderId: 26, classId: 12 },
    { firstName: "Erald", lastName: "Kola", institutionEmail: "ekola27@uet.edu.al", father: "Gjergj", personalEmail: "eri.kola192001.ek@gmail.com", phone: "676981333", orderId: 27, classId: 12 },
    { firstName: "Kjara", lastName: "Kolonja", institutionEmail: "kkolonja@uet.edu.al", father: "Eduard", personalEmail: "kjarakolonja24@gmail.com", phone: "0683832766, 0684591418", orderId: 28, classId: 12 },
    { firstName: "Indrit", lastName: "Llamgozi", institutionEmail: "illamgozi1@uet.edu.al", father: "Ndriçim", personalEmail: "indrit.llamgozi@donbosko.org, inditillamgozi95@gmail.com", phone: "0698369361", orderId: 29, classId: 12 },
    { firstName: "Henerik", lastName: "Lupi", institutionEmail: "hlupi@uet.edu.al", father: "Bektash", personalEmail: "lupihenri@gmail.com", phone: "0694474521", orderId: 30, classId: 12 },
    { firstName: "Megi", lastName: "Marku", institutionEmail: "mmarku11@uet.edu.al", father: "Ilir", personalEmail: "markumegi29@gmail.com", phone: "0673599414, 6735934", orderId: 31, classId: 12 },
    { firstName: "Ersilda", lastName: "Matoshi", institutionEmail: "ematoshi4@uet.edu.al", father: "Sokol", personalEmail: "ersildamatoshi@gmail.com", phone: "0685523593", orderId: 32, classId: 12 },
    { firstName: "Merilda", lastName: "Zenelaj", institutionEmail: "mzenelaj@uet.edu.al", father: "Behar", personalEmail: "merildazenelaj1@gmail.com", phone: "0696080018", orderId: 33, classId: 12 },
    { firstName: "Frenki", lastName: "Meta", institutionEmail: "fmeta@uet.edu.al", father: "Pellumb", personalEmail: "metafrenki@gmail.com", phone: "0684000956", orderId: 34, classId: 12 },
    { firstName: "Samir", lastName: "Meta", institutionEmail: "smeta15@uet.edu.al", father: "Shkëlzen", personalEmail: "samirmeta1345@gmail.com", phone: "0688428340", orderId: 35, classId: 12 },
    { firstName: "Fabian", lastName: "Muça", institutionEmail: "fmuca13@uet.edu.al", father: "Fatos", personalEmail: "fabjan.muca40@gmail.com", phone: "0682621771", orderId: 36, classId: 12 },
    { firstName: "Aleksandro", lastName: "Muceku", institutionEmail: "amuceku4@uet.edu.al", father: "Hazbi", personalEmail: "aleksmuceku31@gmail.com", phone: "0683047980", orderId: 37, classId: 12 },
    { firstName: "Sindi", lastName: "Myrta", institutionEmail: "smyrta2@uet.edu.al", father: "Adriatik", personalEmail: "sindimyrta@gmail.com", phone: "0685101736", orderId: 38, classId: 12 },
    { firstName: "Ornela", lastName: "Myrtaj", institutionEmail: "omyrtaj@uet.edu.al", father: "Leonard", personalEmail: "ornelamyrtaj1@gmail.com", phone: "0698119402", orderId: 39, classId: 12 },
    { firstName: "Leandro", lastName: "Ndoj", institutionEmail: "lndoj3@uet.edu.al", father: "Ardian", personalEmail: "leondoj6@gmail.com", phone: "0686885007", orderId: 40, classId: 12 },
    { firstName: "Adela", lastName: "Ndou", institutionEmail: "andou3@uet.edu.al", father: "Gjovalin", personalEmail: "adelandou@gmail.com", phone: "0688368462", orderId: 41, classId: 12 },
    { firstName: "Sara", lastName: "Paja", institutionEmail: "spaja2@uet.edu.al", father: "Arben", personalEmail: "sarapaja02@gmail.com", phone: "0677179668", orderId: 42, classId: 12 },
    { firstName: "Ardi", lastName: "Qejvani", institutionEmail: "aqejvani@uet.edu.al", father: "Përparim", personalEmail: "ardiqejvani0@gmail.com", phone: "0692929336", orderId: 43, classId: 12 },
    { firstName: "Era", lastName: "Qirjaqi", institutionEmail: "eqirjaqi@uet.edu.al", father: "Alfred", personalEmail: "qirjaqiera@gmail.com", phone: "0675203388", orderId: 44, classId: 12 },
    { firstName: "Jurgen", lastName: "Rade", institutionEmail: "jrade@uet.edu.al", father: "Durim", personalEmail: "jurgenrade1@gmail.com", phone: "0675141221", orderId: 45, classId: 12 },
    { firstName: "Aurora", lastName: "Reci", institutionEmail: "areci8@uet.edu.al", father: "Martin", personalEmail: "aurora.reci@yahoo.com", phone: "0693955313", orderId: 46, classId: 12 },
    { firstName: "Kejsi", lastName: "Reçi", institutionEmail: "kreci4@uet.edu.al", father: "Altin", personalEmail: "kejsireci14@gmail.com", phone: "0676708440", orderId: 47, classId: 12 },
    { firstName: "Artisa", lastName: "Rexha", institutionEmail: "arexha8@uet.edu.al", father: "Agron", personalEmail: "artexha@yahoo.com", phone: "0676286878, 684349264", orderId: 48, classId: 12 },
    { firstName: "Klarida", lastName: "Rokaj", institutionEmail: "krokaj@uet.edu.al", father: "Armir", personalEmail: "klaridarokaj@gmail.com", phone: "685511955", orderId: 49, classId: 12 },
    { firstName: "Silvio", lastName: "Talelli", institutionEmail: "stalelli@uet.edu.al", father: "Besnik", personalEmail: "silviotalelli1@gmail.com", phone: "0697899396", orderId: 50, classId: 12 },
    { firstName: "Ekland", lastName: "Topçiu", institutionEmail: "etopciu2@uet.edu.al", father: "Bujar", personalEmail: "topciuekland@gmail.com", phone: "0696431255", orderId: 51, classId: 12 },
    { firstName: "Erisbiona", lastName: "Tutaj", institutionEmail: "etutaj@uet.edu.al", father: "Isa", personalEmail: "erisbionatutaj@gmail.com", phone: "0676936563", orderId: 52, classId: 12 },
    { firstName: "Kujtime", lastName: "Xhediku", institutionEmail: "kxhediku@uet.edu.al", father: "Adrian", personalEmail: "xhedikukujtime@gmail.com", phone: "0682146161", orderId: 53, classId: 12 },
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