import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backupAttendance() {
  try {
    console.log('📦 Starting attendance data backup...');

    // Fetch all attendance records with related data
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            class: {
              select: {
                name: true
              }
            }
          }
        },
        lecture: {
          select: {
            id: true,
            date: true,
            teachingAssignment: {
              select: {
                subject: {
                  select: {
                    code: true,
                    name: true
                  }
                },
                type: {
                  select: {
                    name: true
                  }
                },
                class: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        status: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { lectureId: 'asc' },
        { studentId: 'asc' }
      ]
    });

    console.log(`✅ Found ${attendanceRecords.length} attendance records`);

    // Generate TypeScript file content
    const fileContent = `// Attendance Backup - Generated on ${new Date().toISOString()}
// Total records: ${attendanceRecords.length}

import { PrismaClient } from '@prisma/client';

export interface AttendanceBackup {
  studentId: number;
  lectureId: number;
  statusId: number;
  studentName?: string;
  className?: string;
  lectureDate?: string;
  subjectCode?: string;
  teachingType?: string;
}

export const attendanceData: AttendanceBackup[] = ${JSON.stringify(
      attendanceRecords.map(record => ({
        studentId: record.studentId,
        lectureId: record.lectureId,
        statusId: record.statusId,
        // Metadata for reference
        studentName: `${record.student.firstName} ${record.student.lastName}`,
        className: record.student.class.name,
        lectureDate: record.lecture.date.toISOString().split('T')[0],
        subjectCode: record.lecture.teachingAssignment.subject.code,
        teachingType: record.lecture.teachingAssignment.type.name,
      })),
      null,
      2
    )};

export async function seedAttendance(prisma: PrismaClient) {
  console.log('📝 Seeding attendance data...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const record of attendanceData) {
    try {
      await prisma.attendance.upsert({
        where: {
          studentId_lectureId: {
            studentId: record.studentId,
            lectureId: record.lectureId
          }
        },
        update: {
          statusId: record.statusId
        },
        create: {
          studentId: record.studentId,
          lectureId: record.lectureId,
          statusId: record.statusId
        }
      });
      successCount++;
    } catch (error) {
      console.error(\`❌ Error seeding attendance for student \${record.studentId}, lecture \${record.lectureId}:\`, error);
      errorCount++;
    }
  }

  console.log(\`✅ Successfully seeded \${successCount} attendance records\`);
  if (errorCount > 0) {
    console.log(\`⚠️  Failed to seed \${errorCount} attendance records\`);
  }
}
`;

    // Save to file
    const backupDir = path.join(__dirname, 'seeds');
    const backupFile = path.join(backupDir, 'attendance-backup.ts');

    // Ensure directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(backupFile, fileContent, 'utf-8');

    console.log(`✅ Backup saved to: ${backupFile}`);
    console.log(`📊 Summary:`);
    console.log(`   - Total records: ${attendanceRecords.length}`);
    
    // Group by status
    const byStatus = attendanceRecords.reduce((acc, record) => {
      const statusName = record.status.name;
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`   - By status:`);
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`     * ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error backing up attendance data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup if executed directly
if (require.main === module) {
  backupAttendance()
    .then(() => {
      console.log('✅ Backup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Backup failed:', error);
      process.exit(1);
    });
}

export default backupAttendance;
