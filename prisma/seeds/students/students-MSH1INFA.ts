import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedStudentsMSH1INFA() {
  console.log("🌱 Seeding students for MSH1INFA...");

  const studentsMSH1INFA = [
    {
      firstName: "Mario",
      father: "Trifon",
      lastName: "Aleksi",
      institutionEmail: "maleksi2@uet.edu.al",
      personalEmail: "marioaleksi@yahoo.com",
      phone: "0692869268",
      orderId: 1,
      classId: 12
    },
    {
      firstName: "Keris",
      father: "Piro",
      lastName: "Babliku",
      institutionEmail: "kbabliku@uet.edu.al",
      personalEmail: "kerisbabliku39@gmail.com",
      phone: "0693528404",
      orderId: 2,
      classId: 12
    },
    {
      firstName: "Rizart",
      father: "Selman",
      lastName: "Belshaku",
      institutionEmail: "rbelshaku@uet.edu.al",
      personalEmail: "rizartbelshaku2@gmail.com",
      phone: "0692932128",
      orderId: 3,
      classId: 12
    },
    {
      firstName: "Leticia",
      father: "Ilirian",
      lastName: "Bitri",
      institutionEmail: "lbitri@uet.edu.al",
      personalEmail: "leticiabitri@icloud.com",
      phone: "676314783",
      orderId: 4,
      classId: 12
    },
    {
      firstName: "Dorian",
      father: "Asllan",
      lastName: "Bozhiqi",
      institutionEmail: "dbozhiqi@uet.edu.al",
      personalEmail: "doridori608@gmail.com",
      phone: "0698725402",
      orderId: 5,
      classId: 12
    },
    {
      firstName: "Dorina",
      father: "Altin",
      lastName: "Caka",
      institutionEmail: "dcaka2@uet.edu.al",
      personalEmail: "dorinacaka2003@gmail.com",
      phone: "0683884210",
      orderId: 6,
      classId: 12
    },
    {
      firstName: "Kleidi",
      father: "Albert",
      lastName: "Çurana",
      institutionEmail: "kcurana@uet.edu.al",
      personalEmail: "curanakleidi@gmail.com",
      phone: "0683338009",
      orderId: 7,
      classId: 12
    },
    {
      firstName: "Bajram",
      father: "Haxhi",
      lastName: "Daci",
      institutionEmail: "bdaci3@uet.edu.al",
      personalEmail: "lamio.daci@pm.me",
      phone: "0686514600",
      orderId: 8,
      classId: 12
    },
    {
      firstName: "Suela",
      father: "Sokol",
      lastName: "Dajlani",
      institutionEmail: "sdajlani@uet.edu.al",
      personalEmail: "sueela29@gmail.com",
      phone: "0684308550",
      orderId: 9,
      classId: 12
    },
    {
      firstName: "Dajana",
      father: "Pellumb",
      lastName: "Dariu",
      institutionEmail: "ddariu@uet.edu.al",
      personalEmail: "dajanadariu21@gmail.com",
      phone: "0694204827",
      orderId: 10,
      classId: 12,
      memo:"Ref. Sueda Fetah"
    },
    {
      firstName: "Livia",
      father: "Artur",
      lastName: "Demiri",
      institutionEmail: "ldemiri1@uet.edu.al",
      personalEmail: "liviademiri24@gmail.com",
      phone: "0687915733",
      orderId: 11,
      classId: 12
    },
    {
      firstName: "Albin",
      father: "Afrim",
      lastName: "Feta",
      institutionEmail: "afeta3@uet.edu.al",
      personalEmail: "1011feta@gmail.com",
      phone: "675601740",
      orderId: 12,
      classId: 12
    },
    {
      firstName: "Besjona",
      father: "Bahir",
      lastName: "Gaba",
      institutionEmail: "bgaba1@uet.edu.al",
      personalEmail: "besjona2016@gmail.com",
      phone: "693465500",
      orderId: 13,
      classId: 12
    },
    {
      firstName: "Rea",
      father: "Arben",
      lastName: "Hida",
      institutionEmail: "rhida2@uet.edu.al",
      personalEmail: "reahidaa@gmail.com",
      phone: "0682781295",
      orderId: 14,
      classId: 12
    },
    {
      firstName: "Dhionisos",
      father: "Erjon",
      lastName: "Hoxha",
      institutionEmail: "dhoxha28@uet.edu.al",
      personalEmail: "dionyshoxha@gmail.com",
      phone: "0694662301",
      orderId: 15,
      classId: 12
    },
    {
      firstName: "Klaudio",
      father: "Arjan",
      lastName: "Hoxha",
      institutionEmail: "khoxha24@uet.edu.al",
      personalEmail: "hklaudio4@gmail.com",
      phone: "0688257550",
      orderId: 16,
      classId: 12
    },
    {
      firstName: "Daniel",
      father: "Thimi",
      lastName: "Hudhra",
      institutionEmail: "dhudhra@uet.edu.al",
      personalEmail: "daniel.hudhra@gmail.com",
      phone: "0682156483",
      orderId: 17,
      classId: 12
    },
    {
      firstName: "Trevi",
      father: "Edmond",
      lastName: "Hysa",
      institutionEmail: "thysa@uet.edu.al",
      personalEmail: "hysatrevi@gmai.com",
      phone: "0683234555",
      orderId: 18,
      classId: 12
    },
    {
      firstName: "Kejsi",
      father: "Bleritn",
      lastName: "Jahaj",
      institutionEmail: "kjahaj3@uet.edu.al",
      personalEmail: "kejsijahaj95@gmail.com",
      phone: "0693990816",
      orderId: 19,
      classId: 12
    },
    {
      firstName: "Llambros",
      father: "Altin",
      lastName: "Janko",
      institutionEmail: "ljanko3@uet.edu.al",
      personalEmail: "llambrosjanko13@gmail.com",
      phone: "0685212006",
      orderId: 20,
      classId: 12
    },
    {
      firstName: "Albi",
      father: "Latif",
      lastName: "Kaçaj",
      institutionEmail: "akacaj@uet.edu.al",
      personalEmail: "albikaci75@gmail.com",
      phone: "0699982662",
      orderId: 21,
      classId: 12
    },
    {
      firstName: "Suela",
      father: "Shefki",
      lastName: "Kadiu",
      institutionEmail: "skadiu@uet.edu.al",
      personalEmail: "suelakadiu03@gmail.com",
      phone: "0683702062",
      orderId: 22,
      classId: 12
    },
    {
      firstName: "Riza",
      father: "Artur",
      lastName: "Kaja",
      institutionEmail: "rkaja@uet.edu.al",
      personalEmail: "rizakaja@yahoo.com",
      phone: "677307635",
      orderId: 23,
      classId: 12
    },
    {
      firstName: "Kelsi",
      father: "Bexhet",
      lastName: "Kambo",
      institutionEmail: "kkambo@uet.edu.al",
      personalEmail: "kelsikelsi737@gmail.com",
      phone: "0673949740",
      orderId: 24,
      classId: 12
    },
    {
      firstName: "Migena",
      father: "Elidon",
      lastName: "Këri",
      institutionEmail: "mkeri@uet.edu.al",
      personalEmail: "migenakeri911@gmail.com",
      phone: "0694661027",
      orderId: 25,
      classId: 12
    },
    {
      firstName: "Kajdro",
      father: "Lonidha",
      lastName: "Koconi",
      institutionEmail: "kkoconi@uet.edu.al",
      personalEmail: "kajdrokoconi12@gmail.com",
      phone: "0695756455",
      orderId: 26,
      classId: 12
    },
    {
      firstName: "Erald",
      father: "Gjergj",
      lastName: "Kola",
      institutionEmail: "ekola27@uet.edu.al",
      personalEmail: "eri.kola192001.ek@gmail.com",
      phone: "676981333",
      orderId: 27,
      classId: 12
    },
    {
      firstName: "Kjara",
      father: "Eduard",
      lastName: "Kolonja",
      institutionEmail: "kkolonja@uet.edu.al",
      personalEmail: "kjarakolonja24@gmail.com",
      phone: "0683832766",
      orderId: 28,
      classId: 12
    },
    {
      firstName: "Indrit",
      father: "Ndriçim",
      lastName: "Llamgozi",
      institutionEmail: "illamgozi1@uet.edu.al",
      personalEmail: "indrit.llamgozi@donbosko.org",
      phone: "0698369361",
      orderId: 29,
      classId: 12
    },
    {
      firstName: "Henerik",
      father: "Bektash",
      lastName: "Lupi",
      institutionEmail: "hlupi@uet.edu.al",
      personalEmail: "lupihenri@gmail.com",
      phone: "0694474521",
      orderId: 30,
      classId: 12
    },
    {
      firstName: "Megi",
      father: "Ilir",
      lastName: "Marku",
      institutionEmail: "mmarku11@uet.edu.al",
      personalEmail: "markumegi29@gmail.com",
      phone: "0673599414",
      orderId: 31,
      classId: 12
    },
    {
      firstName: "Ersilda",
      father: "Sokol",
      lastName: "Matoshi",
      institutionEmail: "ematoshi4@uet.edu.al",
      personalEmail: "ersildamatoshi@gmail.com",
      phone: "0685523593",
      orderId: 32,
      classId: 12
    },
    {
      firstName: "Merilda",
      father: "Behar",
      lastName: "Zenelaj",
      institutionEmail: "mzenelaj@uet.edu.al",
      personalEmail: "merildazenelaj1@gmail.com",
      phone: "0696080018",
      orderId: 33,
      classId: 12
    },
    {
      firstName: "Frenki",
      father: "Pellumb",
      lastName: "Meta",
      institutionEmail: "fmeta@uet.edu.al",
      personalEmail: "metafrenki@gmail.com",
      phone: "0684000956",
      orderId: 34,
      classId: 12
    },
    {
      firstName: "Samir",
      father: "Shkëlzen",
      lastName: "Meta",
      institutionEmail: "smeta15@uet.edu.al",
      personalEmail: "samirmeta1345@gmail.com",
      phone: "0688428340",
      orderId: 35,
      classId: 12
    },
    {
      firstName: "Fabian",
      father: "Fatos",
      lastName: "Muça",
      institutionEmail: "fmuca13@uet.edu.al",
      personalEmail: "fabjan.muca40@gmail.com",
      phone: "0682621771",
      orderId: 36,
      classId: 12
    },
    {
      firstName: "Aleksandro",
      father: "Hazbi",
      lastName: "Muceku",
      institutionEmail: "amuceku4@uet.edu.al",
      personalEmail: "aleksmuceku31@gmail.com",
      phone: "0683047980",
      orderId: 37,
      classId: 12
    },
    {
      firstName: "Sindi",
      father: "Adriatik",
      lastName: "Myrta",
      institutionEmail: "smyrta2@uet.edu.al",
      personalEmail: "sindimyrta@gmail.com",
      phone: "0685101736",
      orderId: 38,
      classId: 12
    },
    {
      firstName: "Ornela",
      father: "Leonard",
      lastName: "Myrtaj",
      institutionEmail: "omyrtaj@uet.edu.al",
      personalEmail: "ornelamyrtaj1@gmail.com",
      phone: "0698119402",
      orderId: 39,
      classId: 12
    },
    {
      firstName: "Leandro",
      father: "Ardian",
      lastName: "Ndoj",
      institutionEmail: "lndoj3@uet.edu.al",
      personalEmail: "leondoj6@gmail.com",
      phone: "0686885007",
      orderId: 40,
      classId: 12
    },
    {
      firstName: "Adela",
      father: "Gjovalin",
      lastName: "Ndou",
      institutionEmail: "andou3@uet.edu.al",
      personalEmail: "adelandou@gmail.com",
      phone: "0688368462",
      orderId: 41,
      classId: 12
    },
    {
      firstName: "Sara",
      father: "Arben",
      lastName: "Paja",
      institutionEmail: "spaja2@uet.edu.al",
      personalEmail: "sarapaja02@gmail.com",
      phone: "0677179668",
      orderId: 42,
      classId: 12
    },
    {
      firstName: "Ardi",
      father: "Përparim",
      lastName: "Qejvani",
      institutionEmail: "aqejvani@uet.edu.al",
      personalEmail: "ardiqejvani0@gmail.com",
      phone: "0692929336",
      orderId: 43,
      classId: 12
    },
    {
      firstName: "Era",
      father: "Alfred",
      lastName: "Qirjaqi",
      institutionEmail: "eqirjaqi@uet.edu.al",
      personalEmail: "qirjaqiera@gmail.com",
      phone: "0675203388",
      orderId: 44,
      classId: 12
    },
    {
      firstName: "Jurgen",
      father: "Durim",
      lastName: "Rade",
      institutionEmail: "jrade@uet.edu.al",
      personalEmail: "jurgenrade1@gmail.com",
      phone: "0675141221",
      orderId: 45,
      classId: 12
    },
    {
      firstName: "Aurora",
      father: "Martin",
      lastName: "Reci",
      institutionEmail: "areci8@uet.edu.al",
      personalEmail: "aurora.reci@yahoo.com",
      phone: "0693955313",
      orderId: 46,
      classId: 12
    },
    {
      firstName: "Kejsi",
      father: "Altin",
      lastName: "Reçi",
      institutionEmail: "kreci4@uet.edu.al",
      personalEmail: "kejsireci14@gmail.com",
      phone: "0676708440",
      orderId: 47,
      classId: 12
    },
    {
      firstName: "Artisa",
      father: "Agron",
      lastName: "Rexha",
      institutionEmail: "arexha8@uet.edu.al",
      personalEmail: "artexha@yahoo.com",
      phone: "0676286878",
      orderId: 48,
      classId: 12
    },
    {
      firstName: "Klarida",
      father: "Armir",
      lastName: "Rokaj",
      institutionEmail: "krokaj@uet.edu.al",
      personalEmail: "klaridarokaj@gmail.com",
      phone: "685511955",
      orderId: 49,
      classId: 12
    },
    {
      firstName: "Ekland",
      father: "Bujar",
      lastName: "Topçiu",
      institutionEmail: "etopciu2@uet.edu.al",
      personalEmail: "topciuekland@gmail.com",
      phone: "0696431255",
      orderId: 50,
      classId: 12
    },
    {
      firstName: "Erisbiona",
      father: "Isa",
      lastName: "Tutaj",
      institutionEmail: "etutaj@uet.edu.al",
      personalEmail: "erisbionatutaj@gmail.com",
      phone: "0676936563",
      orderId: 51,
      classId: 12
    },
    {
      firstName: "Kujtime",
      father: "Adrian",
      lastName: "Xhediku",
      institutionEmail: "kxhediku@uet.edu.al",
      personalEmail: "xhedikukujtime@gmail.com",
      phone: "0682146161",
      orderId: 52,
      classId: 12
    }
  ];

  await prisma.student.createMany({
    data: studentsMSH1INFA,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1INFA.length} student(s) for MSH1INFA!`);
}

// Allow direct execution
if (require.main === module) {
  seedStudentsMSH1INFA()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error("❌ Error seeding students for MSH1INFA:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
