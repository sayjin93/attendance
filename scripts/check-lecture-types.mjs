// fix-lecture-types.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLectureTypes() {
  try {
    console.log('Checking lecture types...');
    
    // Get all lectures and their types
    const lectures = await prisma.lecture.findMany({
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true } },
        type: { select: { id: true, name: true } },
        professor: { select: { firstName: true, lastName: true } }
      },
      orderBy: [{ date: 'desc' }],
      take: 5
    });

    console.log(`Found ${lectures.length} lectures (showing first 5):`);
    
    lectures.forEach((lecture, index) => {
      console.log(`\nLecture ${index + 1}:`);
      console.log(`  Date: ${lecture.date}`);
      console.log(`  Subject: ${lecture.subject.name} (${lecture.subject.code})`);
      console.log(`  Class: ${lecture.class.name}`);
      console.log(`  Professor: ${lecture.professor.firstName} ${lecture.professor.lastName}`);
      console.log(`  TypeId: ${lecture.typeId}`);
      console.log(`  Type: ${lecture.type ? lecture.type.name : 'NULL'}`);
    });

    // Check assignments for comparison
    console.log('\n--- Checking related assignments ---');
    const assignments = await prisma.teachingAssignment.findMany({
      where: {
        professorId: lectures[0]?.professorId
      },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true } },
        type: { select: { id: true, name: true } },
        professor: { select: { firstName: true, lastName: true } }
      },
      take: 3
    });

    assignments.forEach((assignment, index) => {
      console.log(`\nAssignment ${index + 1}:`);
      console.log(`  Subject: ${assignment.subject.name} (${assignment.subject.code})`);
      console.log(`  Class: ${assignment.class.name}`);
      console.log(`  Professor: ${assignment.professor.firstName} ${assignment.professor.lastName}`);
      console.log(`  TypeId: ${assignment.typeId}`);
      console.log(`  Type: ${assignment.type ? assignment.type.name : 'NULL'}`);
    });

  } catch (error) {
    console.error('Error checking lecture types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLectureTypes();