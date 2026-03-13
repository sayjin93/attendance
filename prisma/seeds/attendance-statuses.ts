import type { PrismaClient } from "../prisma";
import { ATTENDANCE_STATUS } from "../../constants/attendanceStatus";

export async function seedAttendanceStatuses(prisma: PrismaClient) {
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
