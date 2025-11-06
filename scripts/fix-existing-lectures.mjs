// fix-existing-lectures.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixExistingLectures() {
  try {
    console.log('Starting to fix existing lectures without type...');
    
    // Get all lectures without a typeId
    const lecturesWithoutType = await prisma.lecture.findMany({
      where: {
        typeId: null
      },
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true } },
        professor: { select: { firstName: true, lastName: true } }
      }
    });

    console.log(`Found ${lecturesWithoutType.length} lectures without type`);

    let fixedCount = 0;
    let notFoundCount = 0;

    for (const lecture of lecturesWithoutType) {
      // Find the corresponding assignment to get the type
      const assignment = await prisma.teachingAssignment.findFirst({
        where: {
          professorId: lecture.professorId,
          subjectId: lecture.subjectId,
          classId: lecture.classId
        },
        include: {
          type: { select: { id: true, name: true } }
        }
      });

      if (assignment && assignment.typeId) {
        // Update the lecture with the type from the assignment
        await prisma.lecture.update({
          where: {
            id: lecture.id
          },
          data: {
            typeId: assignment.typeId
          }
        });

        console.log(`✅ Fixed lecture ${lecture.id}: ${lecture.subject.name} - ${lecture.class.name} → ${assignment.type.name}`);
        fixedCount++;
      } else {
        console.log(`❌ No assignment found for lecture ${lecture.id}: ${lecture.subject.name} - ${lecture.class.name}`);
        notFoundCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Fixed: ${fixedCount} lectures`);
    console.log(`   Not found: ${notFoundCount} lectures`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 Lectures have been updated! The types should now show correctly in the frontend.');
    }

  } catch (error) {
    console.error('❌ Error fixing lecture types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingLectures();