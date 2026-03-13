import type { PrismaClient } from "../prisma";

export async function seedTeachingAssignments(prisma: PrismaClient) {
  console.log("👨‍🏫 Seeding teaching assignments...");
  
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
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 15, // MSH2INF (Master)
      typeId: 2, // Seminar
    },
    {
      professorId: 2,
      subjectId: 3, // Projektim dhe analizë e bazave të të dhënave
      classId: 16, // MSH2TI (Master)
      typeId: 2, // Seminar
    },
  ];
  
  await prisma.teachingAssignment.createMany({
    data: teachingAssignments,
    skipDuplicates: true,
  });
  
  console.log("✅ Teaching Assignments seeded successfully!");
}
