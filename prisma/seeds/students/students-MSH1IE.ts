import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedStudentsMSH1IE() {
  console.log("🌱 Seeding students for MSH1IE...");

  const studentsMSH1IE = [
    { firstName: "Gerti", lastName: "Alimema", institutionEmail: "galimema@uet.edu.al", father: "Besnik", personalEmail: "gertialimema21@gmail.com", phone: "0686787530", orderId: 1, classId: 11 },
    { firstName: "Hike", lastName: "Allamani", institutionEmail: "hallamani@uet.edu.al", father: "Ilir", personalEmail: "hikeallamani@outlook.com", phone: "0683469444", orderId: 2, classId: 11 },
    { firstName: "Leonardo", lastName: "Aruci", institutionEmail: "laruci@uet.edu.al", father: "Shkëlqim", personalEmail: "nardaruci@gmail.com", phone: "0684264800", orderId: 3, classId: 11 },
    { firstName: "Frenkli", lastName: "Bakalli", institutionEmail: "fbakalli@uet.edu.al", father: "Arjan", personalEmail: "bakallifrenkli7@gmail.com", phone: "0682206749", orderId: 4, classId: 11 },
    { firstName: "Denis", lastName: "Bendo", institutionEmail: "dbendo@uet.edu.al", father: "Xhevahir", personalEmail: "bendodenisdb7@gmail.com", phone: "0676880022", orderId: 5, classId: 11 },
    { firstName: "Alden", lastName: "Bici", institutionEmail: "abici5@uet.edu.al", father: "Dritan", personalEmail: "bicialden2@gmail.com", phone: "0683305776", orderId: 6, classId: 11 },
    { firstName: "Meglis", lastName: "Brahusha", institutionEmail: "mbrahusha@uet.edu.al", father: "Gëzim", personalEmail: "megimeglis@icloud.com", phone: "0683316104", orderId: 7, classId: 11 },
    { firstName: "Toeno", lastName: "Bufi", institutionEmail: "tbufi1@uet.edu.al", father: "Thoma", personalEmail: "toeninufi@gmail.com", phone: "0696481983", orderId: 8, classId: 11 },
    { firstName: "Ismail", lastName: "Bulluti", institutionEmail: "ibulluti@uet.edu.al", father: "Bledar", personalEmail: "ismailbulluli@gmail.com", phone: "0677155366", orderId: 9, classId: 11 },
    { firstName: "Silva", lastName: "Ceni", institutionEmail: "sceni@uet.edu.al", father: "Arben", personalEmail: "silvaceni7@gmail.com", phone: "0692130623", orderId: 10, classId: 11 },
    { firstName: "Ateldis", lastName: "Ceno", institutionEmail: "aceno@uet.edu.al", father: "Florenc", personalEmail: "cenoteldi9@gmail.com", phone: "0695290420", orderId: 11, classId: 11 },
    { firstName: "Ani", lastName: "Ciko", institutionEmail: "aciko@uet.edu.al", father: "Ilirian", personalEmail: "anialesi01@gmail.com", phone: "0695317677", orderId: 12, classId: 11 },
    { firstName: "Anisa", lastName: "Cukeli", institutionEmail: "acukeli@uet.edu.al", father: "Vasil", personalEmail: "anisacukeli21@gmail.com", phone: "0696133340", orderId: 13, classId: 11 },
    { firstName: "Kejsi", lastName: "Cypi", institutionEmail: "kcypi@uet.edu.al", father: "Luan", personalEmail: "kejsicypi12@gmail.com", phone: "0692799509", orderId: 14, classId: 11 },
    { firstName: "Mehmet", lastName: "Dova", institutionEmail: "mdova@uet.edu.al", father: "Agron", personalEmail: "metidova99@gmail.com", phone: "0692694789", orderId: 15, classId: 11, memo:'Ref. Miselda' },
    { firstName: "Alesia", lastName: "Elezi", institutionEmail: "aelezi13@uet.edu.al", father: "Alban", personalEmail: "alesia.elezi92@gmail.com", phone: "0688244998", orderId: 16, classId: 11 },
    { firstName: "Enisa", lastName: "Gjokeja", institutionEmail: "egjokeja@uet.edu.al", father: "Genci", personalEmail: "enisagjokeja@gmail.com", phone: "0697587596", orderId: 17, classId: 11 },
    { firstName: "Albi", lastName: "Hallulli", institutionEmail: "ahallulli2@uet.edu.al", father: "Agron", personalEmail: "albihallulli177@gmail.com", phone: "0683366982", orderId: 18, classId: 11 },
    { firstName: "Albi", lastName: "Haxhiu", institutionEmail: "ahaxhiu3@uet.edu.al", father: "Shaban", personalEmail: "albi.play@hotmail.com", phone: "0695206208", orderId: 19, classId: 11 },
    { firstName: "Rei", lastName: "Hysa", institutionEmail: "rhysa4@uet.edu.al", father: "Alfred", personalEmail: "reihysa19@gmail.com", phone: "0696192729", orderId: 20, classId: 11 },
    { firstName: "Ema", lastName: "Hyso", institutionEmail: "ehyso@uet.edu.al", father: "Virjon", personalEmail: "emahyso@gmail.com", phone: "0676862117", orderId: 21, classId: 11 },
    { firstName: "Brikel", lastName: "Ismailaj", institutionEmail: "bismailaj1@uet.edu.al", father: "Arben", personalEmail: "brikelismailaj@gmail.com", phone: "0675456675", orderId: 22, classId: 11 },
    { firstName: "Sindi", lastName: "Jaku", institutionEmail: "sjaku5@uet.edu.al", father: "Artur", personalEmail: "jakusindi07@gmail.com", phone: "0693172388", orderId: 23, classId: 11 },
    { firstName: "Jonela", lastName: "Jonuzaj", institutionEmail: "jjonuzaj@uet.edu.al", father: "Jonus", personalEmail: "jonelajonuzaj1@gmail.com", phone: "0692460864", orderId: 24, classId: 11 },
    { firstName: "Anjeza", lastName: "Kacorri", institutionEmail: "akacorri1@uet.edu.al", father: "Ndue", personalEmail: "anjezakacorri.ak@gmail.com", phone: "0698307714", orderId: 25, classId: 11 },
    { firstName: "Markos", lastName: "Kadiu", institutionEmail: "mkadiu5@uet.edu.al", father: "Kastriot", personalEmail: "markoskadiu600@gmail.com", phone: "0698294404", orderId: 26, classId: 11 },
    { firstName: "Aris", lastName: "Kallembi", institutionEmail: "akallembi@uet.edu.al", father: "Edmond", personalEmail: "aris1kallembi@gmail.com", phone: "0683422738", orderId: 27, classId: 11 },
    { firstName: "Klevis", lastName: "Kosiqi", institutionEmail: "kkosiqi@uet.edu.al", father: "Ndriçim", personalEmail: "kosiqiklevis0@gmail.com", phone: "0685050170", orderId: 28, classId: 11 },
    { firstName: "Eriola", lastName: "Lala", institutionEmail: "elala12@uet.edu.al", father: "Edlir", personalEmail: "eriolalala05@gmail.com", phone: "0692298256", orderId: 29, classId: 11 },
    { firstName: "Mateo", lastName: "Lata", institutionEmail: "mlata5@uet.edu.al", father: "Bashkim", personalEmail: "mateolata54@gmail.com", phone: "0688017418", orderId: 30, classId: 11 },
    { firstName: "Klejvin", lastName: "Lataj", institutionEmail: "klataj@uet.edu.al", father: "Bilbil", personalEmail: "klejvinlataj18@gmail.com", phone: "0693040688", orderId: 31, classId: 11 },
    { firstName: "Manuela", lastName: "Manuka", institutionEmail: "mmanuka@uet.edu.al", father: "Murat", personalEmail: "marina.manukaa@gmail.com", phone: "0683230859", orderId: 32, classId: 11 },
    { firstName: "Esmeraldo", lastName: "Mema", institutionEmail: "emema21@uet.edu.al", father: "Bledar", personalEmail: "nbigthing220@gmail.com", phone: "0696666174", orderId: 33, classId: 11 },
    { firstName: "Bora", lastName: "Mino", institutionEmail: "bmino3@uet.edu.al", father: "Avenir", personalEmail: "bora.mino29@gmail.com", phone: "0693520662", orderId: 34, classId: 11 },
    { firstName: "Ertugel", lastName: "Mone", institutionEmail: "emone@uet.edu.al", father: "Vlashti", personalEmail: "ertugelmone@gmail.com", phone: "0683693272", orderId: 35, classId: 11 },
    { firstName: "Erbi", lastName: "Muhö", institutionEmail: "emuho@uet.edu.al", father: "Arben", personalEmail: "erbimuho16@gmail.com", phone: "0695297661", orderId: 36, classId: 11 },
    { firstName: "Xhevit", lastName: "Musagalliu", institutionEmail: "xmusagalliu@uet.edu.al", father: "Artan", personalEmail: "xhevit.musagalliu@gmail.com", phone: "0675723741", orderId: 37, classId: 11 },
    { firstName: "Klevi", lastName: "Pana", institutionEmail: "kpana@uet.edu.al", father: "Sokol", personalEmail: "klevipana9@gmail.com", phone: "0688740185", orderId: 38, classId: 11 },
    { firstName: "Renato", lastName: "Panavija", institutionEmail: "rpanavija1@uet.edu.al", father: "Erzen", personalEmail: "panavijarenato@gmail.com", phone: "0692059698", orderId: 39, classId: 11 },
    { firstName: "Marjano", lastName: "Prifti", institutionEmail: "mprifti9@uet.edu.al", father: "Kristo", personalEmail: "priftimarjano@gmail.com", phone: "0694471776", orderId: 40, classId: 11 },
    { firstName: "Kledis", lastName: "Sakollari", institutionEmail: "ksakollari1@uet.edu.al", father: "Fatmir", personalEmail: "kledissakollari81@gmail.com", phone: "0685613689", orderId: 41, classId: 11 },
    { firstName: "Francis", lastName: "Shahini", institutionEmail: "fshahini3@uet.edu.al", father: "Sokol", personalEmail: "franci.shahini@icloud.com", phone: "0683047303", orderId: 42, classId: 11 },
    { firstName: "Klejdi", lastName: "Shkurti", institutionEmail: "kshkurti3@uet.edu.al", father: "Dashnor", personalEmail: "klejdishkurti3@gmail.com", phone: "0685590663", orderId: 43, classId: 11 },
    { firstName: "Erzen", lastName: "Shushku", institutionEmail: "eshushku@uet.edu.al", father: "Ilir", personalEmail: "shushkueri1@gmail.com", phone: "0693191814", orderId: 44, classId: 11 },
    { firstName: "Jonida", lastName: "Sokolaj", institutionEmail: "jsokolaj@uet.edu.al", father: "Qamil", personalEmail: "jsokolaj02@gmail.com", phone: "0693860351", orderId: 45, classId: 11 },
    { firstName: "Denisa", lastName: "Spahiu", institutionEmail: "dspahiu3@uet.edu.al", father: "Arben", personalEmail: "denisa.spahiu76@gmail.com", phone: "0686285223", orderId: 46, classId: 11 },
    { firstName: "Herdi", lastName: "Sutaj", institutionEmail: "hsutaj@uet.edu.al", father: "Valendino", personalEmail: "herdisutaj5@gmail.com", phone: "0699484001", orderId: 47, classId: 11 },
    { firstName: "Irdi", lastName: "Sulkurti", institutionEmail: "isulkurti@uet.edu.al", father: "Arben", personalEmail: "floridasulkurti@gmail.com", phone: "0685796345", orderId: 48, classId: 11 },
    { firstName: "Silvio", lastName: "Tena", institutionEmail: "stena@uet.edu.al", father: "Vezir", personalEmail: "silviotena04@gmail.com", phone: "0692913089", orderId: 49, classId: 11 },
    { firstName: "Gladiola", lastName: "Veseli", institutionEmail: "gveseli5@uet.edu.al", father: "Hamdi", personalEmail: "gladiolaveseli@hotmail.com", phone: "0696359106", orderId: 50, classId: 11 },
    { firstName: "Albi", lastName: "Xhaho", institutionEmail: "axhaho2@uet.edu.al", father: "Albert", personalEmail: "albixhaho5@gmail.com", phone: "0699101088", orderId: 51, classId: 11 },
    { firstName: "Arens", lastName: "Xharo", institutionEmail: "axharo@uet.edu.al", father: "Artur", personalEmail: "arensxharo21@gmail.com", phone: "0692034710", orderId: 52, classId: 11 },
    { firstName: "Kristofor", lastName: "Zeqo", institutionEmail: "kzeqo@uet.edu.al", father: "Adrian", personalEmail: "kristozeqo24@gmail.com", phone: "0682990382", orderId: 53, classId: 11 },
    { firstName: "Eleni", lastName: "Zhollanjj", institutionEmail: "ezhollanj@uet.edu.al", father: "Ilir", personalEmail: "eleni.zhollanjj@gmail.com", phone: "0682622292", orderId: 54, classId: 11 },
  ];

  await prisma.student.createMany({
    data: studentsMSH1IE,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${studentsMSH1IE.length} students for MSH1IE!`);
}

// Allow direct execution
if (require.main === module) {
  seedStudentsMSH1IE()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error("❌ Error seeding students for MSH1IE:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
