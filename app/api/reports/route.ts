import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

// Types for report responses
interface ReportClass {
  id: string;
  name: string;
  programId: string;
}

interface ReportSubject {
  id: string;
  name: string;
  code: string;
}

interface ReportStudent {
  id: string;
  firstName: string;
  lastName: string;
  totalLectures: number;
  attendedLectures: number;
  participatedLectures: number;
  attendancePercentage: number;
  passedLectures: boolean;
  totalSeminars: number;
  attendedSeminars: number;
  participatedSeminars: number;
  seminarPercentage: number;
  passedSeminars: boolean;
  overallPassed: boolean;
}

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { decoded } = auth;
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid session or not authenticated!" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    
    const professorId = Number(decoded.professorId);
    const isAdmin = decoded.isAdmin;

    // Always fetch programs
    const programs = await prisma.program.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });

    let classes: ReportClass[] = [];
    let subjects: ReportSubject[] = [];
    let students: ReportStudent[] = [];
    let summary = { totalStudents: 0, passedStudents: 0, failedStudents: 0, averageAttendance: 0 };
    const metadata = { program: "", class: "", subject: "" };

    // If program is selected, fetch classes for that program
    if (programId) {
      let classesData;
      
      if (isAdmin) {
        // Admin can see all classes in the program
        classesData = await prisma.class.findMany({
          where: { programId: parseInt(programId) },
          select: { id: true, name: true, programId: true },
          orderBy: { name: "asc" }
        });
      } else {
        // Professor can only see classes where they have teaching assignments
        classesData = await prisma.class.findMany({
          where: { 
            programId: parseInt(programId),
            teachingAssignments: {
              some: {
                professorId: professorId
              }
            }
          },
          select: { id: true, name: true, programId: true },
          orderBy: { name: "asc" }
        });
      }
      
      classes = classesData.map(c => ({
        id: c.id.toString(),
        name: c.name,
        programId: c.programId.toString()
      }));

      const program = await prisma.program.findUnique({
        where: { id: parseInt(programId) },
        select: { name: true }
      });
      metadata.program = program?.name || "";
    }

    // If class is selected, fetch subjects (assignments) for that class
    if (classId) {
      const classData = await prisma.class.findUnique({
        where: { id: parseInt(classId) },
        select: { 
          name: true,
          program: { select: { name: true } }
        }
      });
      metadata.class = classData?.name || "";
      metadata.program = classData?.program?.name || "";

      // Get unique subjects from teaching assignments for this class
      const assignments = await prisma.teachingAssignment.findMany({
        where: { 
          classId: parseInt(classId),
          ...(isAdmin ? {} : { professorId: professorId })
        },
        include: { 
          subject: { select: { id: true, name: true, code: true } }
        },
        distinct: ['subjectId']
      });

      subjects = assignments.map(a => ({
        id: a.subject.id.toString(),
        name: `${a.subject.code} - ${a.subject.name}`,
        code: a.subject.code
      }));
    }

    // If subject is selected, fetch student reports
    if (subjectId && classId) {
      const subject = await prisma.subject.findUnique({
        where: { id: parseInt(subjectId) },
        select: { name: true, code: true }
      });
      metadata.subject = subject ? `${subject.code} - ${subject.name}` : "";

      // Get all students in the class
      const studentsData = await prisma.student.findMany({
        where: { classId: parseInt(classId) },
        select: { id: true, firstName: true, lastName: true, memo: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
      });

      // Get teaching assignments for this subject and class
      const assignments = await prisma.teachingAssignment.findMany({
        where: {
          classId: parseInt(classId),
          subjectId: parseInt(subjectId)
        },
        include: {
          type: { select: { name: true } }
        }
      });

      // Get all lectures for these assignments
      const lectures = await prisma.lecture.findMany({
        where: {
          teachingAssignment: {
            classId: parseInt(classId),
            subjectId: parseInt(subjectId)
          }
        },
        include: {
          teachingAssignment: {
            select: {
              professorId: true,
              type: { select: { name: true } }
            }
          },
          attendance: {
            select: {
              studentId: true,
              status: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      // Calculate statistics for each student
      students = studentsData.map((student, index) => {
        let totalLectures = 0;
        let attendedLectures = 0;
        let participatedLectures = 0;
        let totalSeminars = 0;
        let attendedSeminars = 0;
        let participatedSeminars = 0;

        // Group lectures by assignment type
        assignments.forEach(assignment => {
          const isLecture = assignment.type.name === "Lecture";
          const isSeminar = assignment.type.name === "Seminar";

          // Find lectures for this assignment's professor
          const assignmentLectures = lectures.filter(
            lecture => lecture.teachingAssignment.professorId === assignment.professorId
          );

          assignmentLectures.forEach(lecture => {
            const studentAttendance = lecture.attendance.find(
              (a: { studentId: number; status: { id: number; name: string } }) => a.studentId === student.id
            );

            if (isLecture) {
              totalLectures++;
              if (studentAttendance) {
                // LEAVE (Leje) should not count as absence - exclude it from total
                if (studentAttendance.status.name === "LEAVE") {
                  totalLectures--; // Don't count this lecture in the total
                } else if (studentAttendance.status.name === "PRESENT" || studentAttendance.status.name === "PARTICIPATED") {
                  attendedLectures++;
                }
                if (studentAttendance.status.name === "PARTICIPATED") {
                  participatedLectures++;
                }
              }
            } else if (isSeminar) {
              totalSeminars++;
              if (studentAttendance) {
                // LEAVE (Leje) should not count as absence - exclude it from total
                if (studentAttendance.status.name === "LEAVE") {
                  totalSeminars--; // Don't count this seminar in the total
                } else if (studentAttendance.status.name === "PRESENT" || studentAttendance.status.name === "PARTICIPATED") {
                  attendedSeminars++;
                }
                if (studentAttendance.status.name === "PARTICIPATED") {
                  participatedSeminars++;
                }
              }
            }
          });
        });

        const attendancePercentage = totalLectures > 0 
          ? (attendedLectures / totalLectures) * 100 
          : 100; // Nëse nuk ka leksione, prezenca është 100%
        const seminarPercentage = totalSeminars > 0 
          ? (attendedSeminars / totalSeminars) * 100 
          : 100; // Nëse nuk ka seminare, prezenca është 100%

        const passedLectures = attendancePercentage >= 50;
        const passedSeminars = totalSeminars === 0 || seminarPercentage >= 75;
        const overallPassed = passedLectures && passedSeminars;

        return {
          id: student.id.toString(),
          rowNumber: index + 1,
          firstName: student.firstName,
          lastName: student.lastName,
          memo: student.memo,
          totalLectures,
          attendedLectures,
          participatedLectures,
          attendancePercentage,
          passedLectures,
          totalSeminars,
          attendedSeminars,
          participatedSeminars,
          seminarPercentage,
          passedSeminars,
          overallPassed
        };
      });

      // Calculate summary
      const totalStudents = students.length;
      const passedStudents = students.filter(s => s.overallPassed).length;
      const failedStudents = totalStudents - passedStudents;
      const averageAttendance = totalStudents > 0
        ? students.reduce((sum, s) => sum + ((s.attendancePercentage + s.seminarPercentage) / 2), 0) / totalStudents
        : 0;

      summary = {
        totalStudents,
        passedStudents,
        failedStudents,
        averageAttendance
      };
    }

    const response = {
      programs: programs.map(p => ({ id: p.id.toString(), name: p.name })),
      classes: classes.map(c => ({ 
        id: c.id.toString(), 
        name: c.name,
        programId: c.programId.toString()
      })),
      subjects,
      students,
      summary,
      metadata
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error in reports API:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports data" },
      { status: 500 }
    );
  }
}
