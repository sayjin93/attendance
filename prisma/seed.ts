import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding the database...");

  // Insert Proffesors
  const professors = [
    {
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "info@jkruja.com",
      password: await bcrypt.hash("Adm!n2025", 10),
      isAdmin: true,
    },
    {
      firstName: "Jurgen",
      lastName: "Kruja",
      username: "jurgenkruja",
      email: "jurgen.kruja@uet.edu.al",
      password: await bcrypt.hash("germany6", 10),
      isAdmin: false,
    },
  ];
  await prisma.professor.createMany({
    data: professors,
    skipDuplicates: true, // ✅ This prevents errors if a professor already exists
  });
  console.log("✅ Professors seeded successfully!");

  // Insert Programs (Bachelor & Master)
  await prisma.program.createMany({
    data: [{ name: "Bachelor" }, { name: "Master" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Programs seeded successfully!");

  // Insert TeachingType (Lecture & Seminar)
  await prisma.teachingType.createMany({
    data: [{ name: "Leksion" }, { name: "Seminar" }],
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ TeachingType seeded successfully!");

  // Insert Classes
  const classes = [
    {
      id: 1,
      name: "INF201",
      programId: 1,
    },
    {
      id: 2,
      name: "INF202",
      programId: 1,
    },
    {
      id: 3,
      name: "INF203",
      programId: 1,
    },
    {
      id: 4,
      name: "INF204",
      programId: 1,
    },
    {
      id: 5,
      name: "INF205",
      programId: 1,
    },
    {
      id: 6,
      name: "INF206",
      programId: 1,
    },
    {
      id: 7,
      name: "Infoek201",
      programId: 1,
    },
    {
      id: 8,
      name: "Infoek202",
      programId: 1,
    },
    {
      id: 9,
      name: "TI201",
      programId: 1,
    },
    {
      id: 10,
      name: "TI202",
      programId: 1,
    },
    {
      id: 11,
      name: "MSH1IE",
      programId: 2,
    },
    {
      id: 12,
      name: "MSH1INFA",
      programId: 2,
    },
    {
      id: 13,
      name: "MSH1INFB",
      programId: 2,
    },
    {
      id: 14,
      name: "MSH1TI",
      programId: 2,
    },
  ];
  await prisma.class.createMany({
    data: classes,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Classes seeded successfully!");

  // Insert Students
  const students = [
    { firstName: "Elios", lastName: "Daliu", email: "edaliu@uet.edu.al", classId: 5 },
    { firstName: "Enri", lastName: "Elezi", email: "eelezi@uet.edu.al", classId: 5 },
    { firstName: "Geraldina", lastName: "Farruku", email: "gfarruku@uet.edu.al", classId: 5 },
    { firstName: "Fiona", lastName: "Guma", email: "fguma@uet.edu.al", classId: 5 },
    { firstName: "Kledisa", lastName: "Haka", email: "khaka@uet.edu.al", classId: 5 },
    { firstName: "Rejdian", lastName: "Hyka", email: "rhyka@uet.edu.al", classId: 5 },
    { firstName: "Jurgi", lastName: "Kule", email: "jkule@uet.edu.al", classId: 5 },
    { firstName: "Oligert", lastName: "Maksuti", email: "omaksuti@uet.edu.al", classId: 5 },
    { firstName: "Nelson", lastName: "Manxharaj", email: "nmanxharaj@uet.edu.al", classId: 5 },
    { firstName: "Flavio", lastName: "Mema", email: "fmema@uet.edu.al", classId: 5 },
    { firstName: "Greta", lastName: "Ndoj", email: "gndoj@uet.edu.al", classId: 5 },
    { firstName: "Erlis", lastName: "Paloka", email: "epaloka@uet.edu.al", classId: 5 },
    { firstName: "Edgar", lastName: "Shaqiri", email: "eshaqiri@uet.edu.al", classId: 5 },
    { firstName: "Luis", lastName: "Shpërdhea", email: "lshperdhea@uet.edu.al", classId: 5 },
    { firstName: "Florian", lastName: "Shurbi", email: "fshurbi@uet.edu.al", classId: 5 },
    { firstName: "Daniel", lastName: "Skënderaj", email: "dskenderaj@uet.edu.al", classId: 5 },
    { firstName: "Denis", lastName: "Sokoli", email: "dsokoli@uet.edu.al", classId: 5 },
    { firstName: "Arvin", lastName: "Xhelilaj", email: "axhelilaj@uet.edu.al", classId: 5 },
    { firstName: "Flavio", lastName: "Zani", email: "fzani@uet.edu.al", classId: 5 },
    { firstName: "Amald", lastName: "Bedini", email: "abedini@uet.edu.al", classId: 6 },
    { firstName: "Eldjon", lastName: "Beharaj", email: "ebeharaj@uet.edu.al", classId: 8 },
    { firstName: "Alesia", lastName: "Bufi", email: "abufi@uet.edu.al", classId: 8 },
    { firstName: "Esa", lastName: "Deliu", email: "edeliu@uet.edu.al", classId: 8 },
    { firstName: "Eni", lastName: "Dema", email: "edema@uet.edu.al", classId: 8 },
    { firstName: "Aqilea", lastName: "Gaqos", email: "agaqos@uet.edu.al", classId: 8 },
    { firstName: "Marjela", lastName: "Gjeloshaj", email: "mgjeloshaj@uet.edu.al", classId: 8 },
    { firstName: "Lorenzo", lastName: "Gjeloshi", email: "lgjeloshi@uet.edu.al", classId: 8 },
    { firstName: "Vanesa", lastName: "Gjika", email: "vgjika@uet.edu.al", classId: 8 },
    { firstName: "Anisa", lastName: "Hajdari", email: "ahajdari@uet.edu.al", classId: 8 },
    { firstName: "Mario", lastName: "Hajderdhi", email: "mhajderdhi@uet.edu.al", classId: 8 },
    { firstName: "Ronela", lastName: "Hoxha", email: "rhoxha@uet.edu.al", classId: 8 },
    { firstName: "Klea Joana", lastName: "Kodhelaj", email: "kkodhelaj@uet.edu.al", classId: 8 },
    { firstName: "Klajdi", lastName: "Kola", email: "kkola@uet.edu.al", classId: 8 },
    { firstName: "Sevastianos", lastName: "Korreshi", email: "skorreshi@uet.edu.al", classId: 8 },
    { firstName: "Kristjen", lastName: "Kurti", email: "kkurti@uet.edu.al", classId: 8 },
    { firstName: "Irakli", lastName: "Mitro", email: "imitro@uet.edu.al", classId: 8 },
    { firstName: "Skender", lastName: "Muçka", email: "smucka@uet.edu.al", classId: 8 },
    { firstName: "Asel", lastName: "Nela", email: "anela@uet.edu.al", classId: 8 },
    { firstName: "Almedina", lastName: "Piranaj", email: "apiranaj@uet.edu.al", classId: 8 },
    { firstName: "Albiona", lastName: "Qinami", email: "aqinami@uet.edu.al", classId: 8 },
    { firstName: "Selma", lastName: "Qoku", email: "sqoku@uet.edu.al", classId: 8 },
    { firstName: "Amelja", lastName: "Rrapaj", email: "arrapaj@uet.edu.al", classId: 8 },
    { firstName: "Erisa", lastName: "Sadikaj", email: "esadikaj@uet.edu.al", classId: 8 },
    { firstName: "Ertugel", lastName: "Saliaj", email: "esaliaj@uet.edu.al", classId: 8 },
    { firstName: "Sara", lastName: "Shehu", email: "sshehu@uet.edu.al", classId: 8 },
    { firstName: "Justin", lastName: "Shtëpani", email: "jshtepani@uet.edu.al", classId: 8 },
    { firstName: "Amela", lastName: "Subashaj", email: "asubashaj@uet.edu.al", classId: 8 },
    { firstName: "Alesjo", lastName: "Sula", email: "asula@uet.edu.al", classId: 8 },
    { firstName: "Olta", lastName: "Xhardo", email: "oxhardo@uet.edu.al", classId: 8 },
    { firstName: "Detjon", lastName: "Xhepi", email: "dxhepi@uet.edu.al", classId: 8 },
    { firstName: "Klea", lastName: "Zhaboli", email: "kzhaboli@uet.edu.al", classId: 8 },
    { firstName: "Eldjon", lastName: "Beharaj", email: "ebeharaj@uet.edu.al", classId: 8 },
    { firstName: "Alesia", lastName: "Bufi", email: "abufi@uet.edu.al", classId: 8 },
    { firstName: "Esa", lastName: "Deliu", email: "edeliu@uet.edu.al", classId: 8 },
    { firstName: "Eni", lastName: "Dema", email: "edema@uet.edu.al", classId: 8 },
    { firstName: "Aqilea", lastName: "Gaqos", email: "agaqos@uet.edu.al", classId: 8 },
    { firstName: "Marjela", lastName: "Gjeloshaj", email: "mgjeloshaj@uet.edu.al", classId: 8 },
    { firstName: "Lorenzo", lastName: "Gjeloshi", email: "lgjeloshi@uet.edu.al", classId: 8 },
    { firstName: "Vanesa", lastName: "Gjika", email: "vgjika@uet.edu.al", classId: 8 },
    { firstName: "Anisa", lastName: "Hajdari", email: "ahajdari@uet.edu.al", classId: 8 },
    { firstName: "Mario", lastName: "Hajderdhi", email: "mhajderdhi@uet.edu.al", classId: 8 },
    { firstName: "Ronela", lastName: "Hoxha", email: "rhoxha@uet.edu.al", classId: 8 },
    { firstName: "Klea Joana", lastName: "Kodhelaj", email: "kkodhelaj@uet.edu.al", classId: 8 },
    { firstName: "Klajdi", lastName: "Kola", email: "kkola@uet.edu.al", classId: 8 },
    { firstName: "Sevastianos", lastName: "Korreshi", email: "skorreshi@uet.edu.al", classId: 8 },
    { firstName: "Kristjen", lastName: "Kurti", email: "kkurti@uet.edu.al", classId: 8 },
    { firstName: "Irakli", lastName: "Mitro", email: "imitro@uet.edu.al", classId: 8 },
    { firstName: "Skender", lastName: "Muçka", email: "smucka@uet.edu.al", classId: 8 },
    { firstName: "Asel", lastName: "Nela", email: "anela@uet.edu.al", classId: 8 },
    { firstName: "Almedina", lastName: "Piranaj", email: "apiranaj@uet.edu.al", classId: 8 },
    { firstName: "Albiona", lastName: "Qinami", email: "aqinami@uet.edu.al", classId: 8 },
    { firstName: "Selma", lastName: "Qoku", email: "sqoku@uet.edu.al", classId: 8 },
    { firstName: "Amelja", lastName: "Rrapaj", email: "arrapaj@uet.edu.al", classId: 8 },
    { firstName: "Erisa", lastName: "Sadikaj", email: "esadikaj@uet.edu.al", classId: 8 },
    { firstName: "Ertugel", lastName: "Saliaj", email: "esaliaj@uet.edu.al", classId: 8 },
    { firstName: "Sara", lastName: "Shehu", email: "sshehu@uet.edu.al", classId: 8 },
    { firstName: "Justin", lastName: "Shtëpani", email: "jshtepani@uet.edu.al", classId: 8 },
    { firstName: "Amela", lastName: "Subashaj", email: "asubashaj@uet.edu.al", classId: 8 },
    { firstName: "Alesjo", lastName: "Sula", email: "asula@uet.edu.al", classId: 8 },
    { firstName: "Olta", lastName: "Xhardo", email: "oxhardo@uet.edu.al", classId: 8 },
    { firstName: "Detjon", lastName: "Xhepi", email: "dxhepi@uet.edu.al", classId: 8 },
    { firstName: "Klea", lastName: "Zhaboli", email: "kzhaboli@uet.edu.al", classId: 8 },
  ];
  await prisma.student.createMany({
    data: students,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Studens seeded successfully!");

  // Insert Subjects
  const subjects = [
    {
      id: 1,
      code: "CIS242/B",
      name: "Teori e bazave të të dhënave",
      programId: 1,
    },
    {
      id: 2,
      code: "CIS280",
      name: "Web Development",
      programId: 1,
    },
    {
      id: 3,
      code: "CIS518",
      name: "Projektim dhe analizë e bazave të të dhënave",
      programId: 2,
    },
    {
      id: 4,
      code: "CIS555",
      name: "Zhvillim webi: aplikime dhe programim",
      programId: 2,
    },
  ];
  await prisma.subject.createMany({
    data: subjects,
    skipDuplicates: true, // ✅ Prevents errors if they already exist
  });
  console.log("✅ Subjects seeded successfully!");

  // Insert TeachingAssignments (linking Professors with Subjects, Classes, and Types)
  const teachingAssignments = [
    // Jurgen Kruja teaching Database Theory to INF201 (Bachelor)
    {
      professorId: 2, // Jurgen Kruja
      subjectId: 1, // Teori e bazave të të dhënave
      classId: 5, // INF205
      typeId: 2, // Seminar
    },
    {
      professorId: 2, // Jurgen Kruja
      subjectId: 1, // Teori e bazave të të dhënave
      classId: 6, // INF206
      typeId: 2, // Seminar
    },
    {
      professorId: 2, // Jurgen Kruja
      subjectId: 1, // Teori e bazave të të dhënave
      classId: 8, // Infoek202
      typeId: 2, // Seminar
    },
    // Jurgen Kruja teaching Database Design to Master classes
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 11, // IE (Master)
      typeId: 2, // Seminar
    },
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 12, // INFA (Master)
      typeId: 2, // Seminar
    },
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 13, // INFB (Master)
      typeId: 2, // Seminar
    },
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 14, // TI (Master)
      typeId: 2, // Seminar
    },
  ];
  await prisma.teachingAssignment.createMany({
    data: teachingAssignments,
    skipDuplicates: true,
  });
  console.log("✅ Teaching Assignments seeded successfully!");

  // Insert Lectures
  // const lectures = [
  //   // Database Theory Lectures for INF201
  //   {
  //     date: new Date("2025-01-15"),
  //     professorId: 2,
  //     classId: 1,
  //     subjectId: 1,
  //     typeId: 1, // Leksion
  //   },
  //   {
  //     date: new Date("2025-01-17"),
  //     professorId: 2,
  //     classId: 1,
  //     subjectId: 1,
  //     typeId: 2, // Seminar
  //   },
  //   {
  //     date: new Date("2025-01-22"),
  //     professorId: 2,
  //     classId: 1,
  //     subjectId: 1,
  //     typeId: 1, // Leksion
  //   },
  //   // Web Development Lectures for INF201
  //   {
  //     date: new Date("2025-01-20"),
  //     professorId: 2,
  //     classId: 1,
  //     subjectId: 2,
  //     typeId: 1, // Leksion
  //   },
  //   {
  //     date: new Date("2025-01-25"),
  //     professorId: 2,
  //     classId: 1,
  //     subjectId: 2,
  //     typeId: 2, // Seminar
  //   },
  //   // Database Design Lectures for Master
  //   {
  //     date: new Date("2025-01-18"),
  //     professorId: 2,
  //     classId: 3, // INF Master
  //     subjectId: 3,
  //     typeId: 1, // Leksion
  //   },
  //   {
  //     date: new Date("2025-01-19"),
  //     professorId: 2,
  //     classId: 4, // IE Master
  //     subjectId: 3,
  //     typeId: 1, // Leksion
  //   },
  //   // Advanced Web Development Lectures for Master
  //   {
  //     date: new Date("2025-01-21"),
  //     professorId: 2,
  //     classId: 3, // INF Master
  //     subjectId: 4,
  //     typeId: 1, // Leksion
  //   },
  //   {
  //     date: new Date("2025-01-23"),
  //     professorId: 2,
  //     classId: 3,
  //     subjectId: 4,
  //     typeId: 2, // Seminar
  //   },
  //   {
  //     date: new Date("2025-01-24"),
  //     professorId: 2,
  //     classId: 5, // TI Master
  //     subjectId: 4,
  //     typeId: 1, // Leksion
  //   },
  // ];
  // await prisma.lecture.createMany({
  //   data: lectures,
  //   skipDuplicates: true,
  // });
  // console.log("✅ Lectures seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });