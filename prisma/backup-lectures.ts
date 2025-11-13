import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function backupLectures() {
  console.log("📚 Backing up lectures...");

  // Fetch all lectures with related data
  const lectures = await prisma.lecture.findMany({
    include: {
      teachingAssignment: {
        include: {
          subject: true,
          class: {
            include: {
              program: true,
            },
          },
          type: true,
          professor: true,
        },
      },
    },
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  console.log(`Found ${lectures.length} lectures to backup`);

  // Generate TypeScript interface
  const tsContent = `import { PrismaClient } from "@prisma/client";

export interface LectureBackup {
  teachingAssignmentId: number;
  date: string; // ISO 8601 format
}

export const lecturesBackupData: LectureBackup[] = [
${lectures
  .map((lecture) => {
    const dateStr = lecture.date.toISOString().split("T")[0];
    const ta = lecture.teachingAssignment;
    const professorName = `${ta.professor.firstName} ${ta.professor.lastName}`;
    const metadata = `  // Subject: ${ta.subject.name} | Class: ${ta.class.name} (${ta.class.program.name}) | Type: ${ta.type.name} | Professor: ${professorName} | Date: ${dateStr}`;
    return `${metadata}\n  { teachingAssignmentId: ${lecture.teachingAssignmentId}, date: "${dateStr}" },`;
  })
  .join("\n")}
];

export async function seedLectures(prisma: PrismaClient) {
  console.log("📚 Seeding lectures...");

  let created = 0;
  let updated = 0;

  for (const lecture of lecturesBackupData) {
    const existing = await prisma.lecture.findUnique({
      where: {
        teachingAssignmentId_date: {
          teachingAssignmentId: lecture.teachingAssignmentId,
          date: new Date(lecture.date),
        },
      },
    });

    if (existing) {
      updated++;
    } else {
      await prisma.lecture.create({
        data: {
          teachingAssignmentId: lecture.teachingAssignmentId,
          date: new Date(lecture.date),
        },
      });
      created++;
    }
  }

  console.log(\`✅ Seeded \${lecturesBackupData.length} lectures (\${created} created, \${updated} updated)\`);
}
`;

  // Write to file
  const outputPath = path.join(__dirname, "seeds", "lectures-backup.ts");
  fs.writeFileSync(outputPath, tsContent, "utf-8");

  console.log(`✅ Backup saved to: ${outputPath}`);

  // Display statistics by subject and teaching type
  const stats: Record<string, { lectures: number; seminars: number }> = {};

  lectures.forEach((lecture) => {
    const key = lecture.teachingAssignment.subject.name;
    if (!stats[key]) {
      stats[key] = { lectures: 0, seminars: 0 };
    }
    if (lecture.teachingAssignment.type.name === "Leksion") {
      stats[key].lectures++;
    } else if (lecture.teachingAssignment.type.name === "Seminar") {
      stats[key].seminars++;
    }
  });

  console.log("\nLectures by Subject:");
  Object.entries(stats)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([subject, counts]) => {
      console.log(
        `  ${subject}: ${counts.lectures} Leksione, ${counts.seminars} Seminare`
      );
    });

  console.log(`\nTotal: ${lectures.length} lectures backed up`);
}

backupLectures()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Error backing up lectures:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
