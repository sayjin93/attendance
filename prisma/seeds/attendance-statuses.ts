import { PrismaClient } from "@prisma/client";
import { ATTENDANCE_STATUS } from "../../constants/attendanceStatus";

const prisma = new PrismaClient();

export async function seedAttendanceStatuses() {
  console.log("✅ Seeding attendance statuses...");
  
  // Insert Attendance Statuses using constants
  const attendanceStatuses = Object.values(ATTENDANCE_STATUS);
  
  for (const status of attendanceStatuses) {
    await prisma.attendanceStatus.upsert({
      where: { id: status.id },
      update: { name: status.name },
      create: status,
    });
  }
  
  console.log("✅ Attendance Statuses seeded successfully!");
}

// Allow direct execution
if (require.main === module) {
  seedAttendanceStatuses()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error("❌ Error seeding attendance statuses:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}