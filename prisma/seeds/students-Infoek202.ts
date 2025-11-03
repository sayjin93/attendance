import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedStudentsInfoek202() {
  console.log("🌱 Seeding students for Infoek202...");

  const studentsInfoek202 = [
    { firstName: "Gerald", lastName: "Balla", institutionEmail: "gballa6@uet.edu.al", father: "Artian", personalEmail: "geriballa4@gmail.com", phone: "0677275545", orderId: 1, classId: 8 },
    { firstName: "Eldjon", lastName: "Beharaj", institutionEmail: "ebeharaj@uet.edu.al", father: "Juljan", personalEmail: "eldjonbeharaj1@gmail.com", phone: "0692159751", orderId: 2, classId: 8 },
    { firstName: "Alesia", lastName: "Bufi", institutionEmail: "abufi2@uet.edu.al", father: "Ilir", personalEmail: "alesiabufi36@gmail.com", phone: "0695150047", orderId: 3, classId: 8 },
    { firstName: "Esa", lastName: "Deliu", institutionEmail: "edeliu3@uet.edu.al", father: "Eduard", personalEmail: "esadeliu319@gmail.com", phone: "0693506851", orderId: 4, classId: 8 },
    { firstName: "Juljan", lastName: "Deliu", institutionEmail: "jdeliu2@uet.edu.al", father: "Fetah", personalEmail: "deliujuli77@gmail.com", phone: "0695517620", orderId: 5, classId: 8 },
    { firstName: "Eni", lastName: "Dema", institutionEmail: "edema7@uet.edu.al", father: "Shkëlzen", personalEmail: "enidema75@gmail.com", phone: "0683929494", orderId: 6, classId: 8 },
    { firstName: "Fabian", lastName: "Ferhati", institutionEmail: "fferhati@uet.edu.al", father: "Zamir", personalEmail: "edlira.ferhati@gmail.com", phone: "0692422250", orderId: 7, classId: 8 },
    { firstName: "Aqilea", lastName: "Gaqos", institutionEmail: "agaqos@uet.edu.al", father: "Dhimitraq", personalEmail: "aqileagaqos@gmail.com", phone: "0695548222", orderId: 8, classId: 8 },
    { firstName: "Marjela", lastName: "Gjeloshaj", institutionEmail: "mgjeloshaj@uet.edu.al", father: "Vladimir", personalEmail: "gj.marjela05@gmail.com", phone: "0696602880", orderId: 9, classId: 8 },
    { firstName: "Lorenzo", lastName: "Gjeloshi", institutionEmail: "lgjeloshi@uet.edu.al", father: "Françesko", personalEmail: "lorenzogjeloshi277@gmail.com", phone: "0688409162", orderId: 10, classId: 8 },
    { firstName: "Vanesa", lastName: "Gjika", institutionEmail: "vgjika2@uet.edu.al", father: "Dashmir", personalEmail: "vanesagjika@icloud.com", phone: "0682151458", orderId: 11, classId: 8 },
    { firstName: "Anisa", lastName: "Hajdari", institutionEmail: "ahajdari8@uet.edu.al", father: "Fredi", personalEmail: "anisahajdari@gmail.com", phone: "0695312510", orderId: 12, classId: 8 },
    { firstName: "Mario", lastName: "Hajderdhi", institutionEmail: "mhajderdhi@uet.edu.al", father: "Romeo", personalEmail: "mhajderdhi@gmail.com", phone: "0698609906", orderId: 13, classId: 8 },
    { firstName: "Ronela", lastName: "Hoxha", institutionEmail: "rhoxha24@uet.edu.al", father: "Alket", personalEmail: "ronelahoxha2006@gmail.com", phone: "0694448127", orderId: 14, classId: 8 },
    { firstName: "Klea Joana", lastName: "Kodhelaj", institutionEmail: "kkodhelaj@uet.edu.al", father: "Viktor", personalEmail: "kleakodhelaj@gmail.com", phone: "0693206289", orderId: 15, classId: 8 },
    { firstName: "Klajdi", lastName: "Kola", institutionEmail: "kkola10@uet.edu.al", father: "Blendi", personalEmail: "lidakola746@gmail.com", phone: "0694536022", orderId: 16, classId: 8 },
    { firstName: "Sevastianos", lastName: "Korreshi", institutionEmail: "skorreshi@uet.edu.al", father: "Xhaferr", personalEmail: "sebikorreshi@gmail.com", phone: "0695233836", orderId: 17, classId: 8 },
    { firstName: "Kristjen", lastName: "Kurti", institutionEmail: "kkurti9@uet.edu.al", father: "Kliton", personalEmail: "kristjenkurti1@gmail.com", phone: "0693967482", orderId: 18, classId: 8 },
    { firstName: "Skender", lastName: "Muçka", institutionEmail: "smucka2@uet.edu.al", father: "Ilir", personalEmail: "nerimucka@icloud.com", phone: "0696202143", orderId: 19, classId: 8 },
    { firstName: "Asel", lastName: "Nela", institutionEmail: "anela2@uet.edu.al", father: "Leonarh", personalEmail: "aselnela05@hotmail.com", phone: "0692323186", orderId: 20, classId: 8 },
    { firstName: "Almedina", lastName: "Piranaj", institutionEmail: "apiranaj2@uet.edu.al", father: "Astrit", personalEmail: "almedina.piranaj@gmail.com", phone: "0677105815", orderId: 21, classId: 8 },
    { firstName: "Albiona", lastName: "Qinami", institutionEmail: "aqinami6@uet.edu.al", father: "Fatmir", personalEmail: "albionaqinami@gmail.com", phone: "0683208132", orderId: 22, classId: 8 },
    { firstName: "Selma", lastName: "Qoku", institutionEmail: "sqoku@uet.edu.al", father: "Gentian", personalEmail: "selmaqoku9@gmail.com", phone: "0696964438", orderId: 23, classId: 8 },
    { firstName: "Erjon", lastName: "Rira", institutionEmail: "erira4@uet.edu.al", father: "Ilir", personalEmail: "erjonrira@gmail.com", phone: "0677333641", orderId: 24, classId: 8 },
    { firstName: "Amelja", lastName: "Rrapaj", institutionEmail: "arrapaj@uet.edu.al", father: "Ilir", personalEmail: "sararrapaj@hotmail.com", phone: "0694625377", orderId: 25, classId: 8 },
    { firstName: "Erisa", lastName: "Sadikaj", institutionEmail: "esadikaj4@uet.edu.al", father: "Lavderim", personalEmail: "erisasadikaj10@gmail.com", phone: "0693431603", orderId: 26, classId: 8 },
    { firstName: "Ertugel", lastName: "Saliaj", institutionEmail: "esaliaj11@uet.edu.al", father: "Ilirjan", personalEmail: "ertugelsaliaj04@gmail.com", phone: "0684782400", orderId: 27, classId: 8 },
    { firstName: "Sara", lastName: "Shehu", institutionEmail: "sshehu16@uet.edu.al", father: "Kastriot", personalEmail: "sarashehu1329@gmail.com", phone: "0682936354", orderId: 28, classId: 8 },
    { firstName: "Justin", lastName: "Shtëpani", institutionEmail: "jshtepani@uet.edu.al", father: "Elmond", personalEmail: "jshtepani@icloud.com", phone: "0688262456", orderId: 29, classId: 8 },
    { firstName: "Amela", lastName: "Subashaj", institutionEmail: "asubashaj@uet.edu.al", father: "Nimet", personalEmail: "amelasubashaj@gmail.com", phone: "0694778875", orderId: 30, classId: 8 },
    { firstName: "Alesjo", lastName: "Sula", institutionEmail: "asula17@uet.edu.al", father: "Shazivar", personalEmail: "alesjosula5@gmail.com", phone: "0684492437", orderId: 31, classId: 8 },
    { firstName: "Olta", lastName: "Xhardo", institutionEmail: "oxhardo@uet.edu.al", father: "Roland", personalEmail: "oltaxhardo9@gmail.com", phone: "0692896381", orderId: 32, classId: 8 },
    { firstName: "Detjon", lastName: "Xhepi", institutionEmail: "dxhepi@uet.edu.al", father: "Petrit", personalEmail: "detjonxhepi@gmail.com", phone: "0695570300", orderId: 33, classId: 8 },
    { firstName: "Klea", lastName: "Zhaboli", institutionEmail: "kzhaboli@uet.edu.al", father: "Afrim", personalEmail: "kleazhaboli@gmail.com", phone: "0676665877", orderId: 34, classId: 8 },
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
