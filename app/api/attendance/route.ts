import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Fetch Attendance API
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professorId = searchParams.get("professorId") ?? undefined;
    const classId = searchParams.get("classId") ?? undefined;
    const lectureId = searchParams.get("lectureId") ?? undefined;

    if (!professorId) {
      return NextResponse.json(
        { error: "❌ Professor ID is required!" },
        { status: 400 }
      );
    }

    // ✅ Fetch students of the selected class
    const students = await prisma.student.findMany({
      where: {
        classId: classId ? parseInt(classId, 10) : undefined
      },
      select: { id: true, firstName: true, lastName: true },
    });

    // ✅ Fetch attendance records for the selected lecture
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        lectureId: lectureId ? parseInt(lectureId, 10) : undefined
      },
      select: { studentId: true, status: true },
    });

    // ✅ Merge attendance status with students list
    const studentsWithAttendance = students.map((student) => {
      const attendance = attendanceRecords.find(
        (att) => att.studentId === student.id
      );
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        status: attendance ? attendance.status : "PRESENT", // Default status
      };
    });

    return NextResponse.json(studentsWithAttendance || [], { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    return NextResponse.json(
      { error: "⚠️ Failed to fetch attendance" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ Update/Create Attendance API - Supports both single and batch updates
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Check if it's a batch update (array) or single update (object)
    const isBatchUpdate = Array.isArray(body);
    
    if (isBatchUpdate) {
      // Handle batch updates
      const attendanceUpdates = body;
      
      if (!attendanceUpdates.length) {
        return NextResponse.json(
          { error: "❌ Lista e prezencës është e zbrazët!" },
          { status: 400 }
        );
      }

      // Validate all entries
      for (const update of attendanceUpdates) {
        if (!update.studentId || !update.lectureId || !update.status) {
          return NextResponse.json(
            { error: "❌ Të dhëna të paplota në listën e prezencës!" },
            { status: 400 }
          );
        }
      }

      const lectureId = parseInt(attendanceUpdates[0].lectureId, 10);
      
      // Get existing attendance records for this lecture
      const existingAttendances = await prisma.attendance.findMany({
        where: { 
          lectureId,
          studentId: { in: attendanceUpdates.map(u => parseInt(u.studentId, 10)) }
        },
      });

      // Prepare updates and creates
      const updates = [];
      const creates = [];

      for (const update of attendanceUpdates) {
        const studentIdInt = parseInt(update.studentId, 10);
        const existing = existingAttendances.find(a => a.studentId === studentIdInt);
        
        if (existing) {
          updates.push(
            prisma.attendance.update({
              where: { id: existing.id },
              data: { status: update.status },
            })
          );
        } else {
          creates.push({
            studentId: studentIdInt,
            lectureId,
            status: update.status,
          });
        }
      }

      // Execute all updates and creates in parallel
      await Promise.all([
        ...updates,
        ...(creates.length > 0 ? [prisma.attendance.createMany({ data: creates })] : [])
      ]);

      return NextResponse.json(
        { 
          message: "✅ Prezenca u regjistrua me sukses për të gjithë studentët!",
          updated: updates.length,
          created: creates.length
        },
        { status: 200 }
      );
      
    } else {
      // Handle single update (backward compatibility)
      const { studentId, lectureId, status } = body;

      if (!studentId || !lectureId || !status) {
        return NextResponse.json(
          { error: "❌ Të dhëna të paplota!" },
          { status: 400 }
        );
      }

      const lectureIdInt = parseInt(lectureId, 10);
      const studentIdInt = parseInt(studentId, 10);

      const existingAttendance = await prisma.attendance.findFirst({
        where: { studentId: studentIdInt, lectureId: lectureIdInt },
      });

      if (existingAttendance) {
        await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: { status },
        });
        return NextResponse.json(
          { message: "✅ Prezenca u përditësua me sukses!" },
          { status: 200 }
        );
      } else {
        await prisma.attendance.create({
          data: { studentId: studentIdInt, lectureId: lectureIdInt, status },
        });
        return NextResponse.json(
          { message: "✅ Prezenca u regjistrua me sukses!" },
          { status: 201 }
        );
      }
    }
  } catch (error) {
    console.error("❌ Error during attendance update:", error);
    return NextResponse.json(
      { error: "⚠️ Gabim në server, provo përsëri!" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
