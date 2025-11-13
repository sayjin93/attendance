import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAttendanceStatuses() {
  try {
    const statuses = await prisma.attendanceStatus.findMany();
    console.log("Current attendance statuses in database:");
    console.table(statuses);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAttendanceStatuses();