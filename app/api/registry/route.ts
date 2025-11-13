import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { authenticateRequest } from "@/app/(pages)/utils/authenticateRequest";

interface RegistryStudent {
  id: string;
  firstName: string;
  lastName: string;
}

interface RegistryLecture {
  id: string;
  date: string;
  typeId: string;
  typeName: string;
}

interface RegistryAttendance {
  studentId: string;
  lectureId: string;
  status: { id: number; name: string };
}

interface StudentRegistryRow {
  student: RegistryStudent;
  attendanceByLecture: { [lectureId: string]: { id: number; name: string } | null };
  absenceCount: number;
  totalLectures: number;
  absencePercentage: number;
  status: 'NK' | 'OK';
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
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const typeId = searchParams.get("typeId");
    const selectedProfessorId = searchParams.get("professorId"); // For admin selection
    
    const currentProfessorId = Number(decoded.professorId);
    const isAdmin = decoded.isAdmin;

    // Always fetch programs
    const programs = await prisma.program.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });

    let classes: { id: string; name: string; programId: string }[] = [];
    let subjects: { id: string; name: string; code: string }[] = [];
    let types: { id: string; name: string }[] = [];
    let professors: { id: string; firstName: string; lastName: string }[] = [];
    let lectures: RegistryLecture[] = [];
    let students: RegistryStudent[] = [];
    let attendance: RegistryAttendance[] = [];
    let registryRows: StudentRegistryRow[] = [];

    // Handle professor data differently for admin vs regular professor
    if (isAdmin) {
      // For admin, fetch all professors except admin users
      const allProfessors = await prisma.professor.findMany({
        where: {
          isAdmin: false  // Exclude admin users from the list
        },
        select: { id: true, firstName: true, lastName: true },
        orderBy: { firstName: "asc" }
      });
      
      professors = allProfessors.map(p => ({
        id: p.id.toString(),
        firstName: p.firstName,
        lastName: p.lastName
      }));
    } else {
      // For non-admin users, include current professor info
      const currentProfessor = await prisma.professor.findUnique({
        where: { id: currentProfessorId },
        select: { id: true, firstName: true, lastName: true }
      });
      
      if (currentProfessor) {
        professors = [{
          id: currentProfessor.id.toString(),
          firstName: currentProfessor.firstName,
          lastName: currentProfessor.lastName
        }];
      }
    }

    // Determine which professor's classes to show
    const effectiveProfessorId = isAdmin && selectedProfessorId 
      ? parseInt(selectedProfessorId) 
      : currentProfessorId;

    // Always fetch classes - either all for admin (when no professor selected) or filtered for specific professor
    let classesData;
    
    if (isAdmin && !selectedProfessorId) {
      // Admin with no professor selected - show all classes
      classesData = await prisma.class.findMany({
        select: { id: true, name: true, programId: true },
        orderBy: { name: "asc" }
      });
    } else {
      // Show classes for specific professor (either selected admin professor or current professor)
      classesData = await prisma.class.findMany({
        where: { 
          teachingAssignments: {
            some: {
              professorId: effectiveProfessorId
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

    // If class is selected, fetch subjects (assignments) for that class
    if (classId) {
      // Get unique subjects from teaching assignments for this class
      const assignments = await prisma.teachingAssignment.findMany({
        where: { 
          classId: parseInt(classId),
          professorId: effectiveProfessorId
        },
        include: { 
          subject: { select: { id: true, name: true, code: true } }
        },
        distinct: ['subjectId']
      });

      subjects = assignments.map(a => ({
        id: a.subject.id.toString(),
        name: a.subject.name,
        code: a.subject.code
      }));
    }

    // If subject is selected, fetch types available for that subject and class
    if (subjectId && classId) {
      const assignments = await prisma.teachingAssignment.findMany({
        where: {
          classId: parseInt(classId),
          subjectId: parseInt(subjectId),
          professorId: effectiveProfessorId
        },
        include: {
          type: { select: { id: true, name: true } }
        },
        distinct: ['typeId']
      });

      types = assignments.map(a => ({
        id: a.type.id.toString(),
        name: a.type.name
      }));
    }

    // If all required filters are selected, fetch the registry data
    const finalProfessorId = effectiveProfessorId.toString();
    
    if (classId && subjectId && typeId && finalProfessorId) {
      // Get all students in the class
      const studentsData = await prisma.student.findMany({
        where: { classId: parseInt(classId) },
        select: { id: true, firstName: true, lastName: true, memo: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
      });

      students = studentsData.map(s => ({
        id: s.id.toString(),
        firstName: s.firstName,
        lastName: s.lastName,
        memo: s.memo
      }));

      // Get all lectures for the specified criteria
      console.log('Querying lectures with params:', {
        classId: parseInt(classId),
        subjectId: parseInt(subjectId),
        professorId: parseInt(finalProfessorId),
        typeId: parseInt(typeId)
      });
      
      // First try to get lectures that match the teaching assignment
      const lecturesData = await prisma.lecture.findMany({
        where: {
          teachingAssignment: {
            classId: parseInt(classId),
            subjectId: parseInt(subjectId),
            professorId: parseInt(finalProfessorId),
            typeId: parseInt(typeId)
          }
        },
        include: {
          teachingAssignment: {
            select: {
              typeId: true,
              type: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { date: 'asc' }
      });
      
      // Remove the typeId filtering since we're already filtering by typeId in the query above

      lectures = lecturesData.map(l => ({
        id: l.id.toString(),
        date: l.date.toISOString(),
        typeId: typeId,
        typeName: l.teachingAssignment.type.name || ''
      }));

      // Get all attendance records for these lectures
      if (lectures.length > 0) {
        console.log('Looking for attendance for lecture IDs:', lectures.map(l => l.id));
        
        const attendanceData = await prisma.attendance.findMany({
          where: {
            lectureId: {
              in: lectures.map(l => parseInt(l.id))
            }
          },
          select: {
            studentId: true,
            lectureId: true,
            status: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        console.log('Found attendance records:', attendanceData.length);

        attendance = attendanceData.map(a => ({
          studentId: a.studentId.toString(),
          lectureId: a.lectureId.toString(),
          status: a.status
        }));

        // Calculate registry rows
        const selectedType = types.find(t => t.id === typeId);
        const isLecture = selectedType?.name === 'Leksion';
        const failureThreshold = isLecture ? 0.5 : 0.25; // 50% for lectures, 25% for seminars

        registryRows = students.map(student => {
          const attendanceByLecture: { [lectureId: string]: { id: number; name: string } | null } = {};
          let absenceCount = 0;

          // Initialize attendance for all lectures
          lectures.forEach(lecture => {
            attendanceByLecture[lecture.id] = null;
          });

          // Fill in actual attendance
          attendance.forEach(att => {
            if (att.studentId === student.id) {
              attendanceByLecture[att.lectureId] = att.status;
              if (att.status.name === 'ABSENT') {
                absenceCount++;
              }
            }
          });

          const totalLectures = lectures.length;
          const absencePercentage = totalLectures > 0 ? absenceCount / totalLectures : 0;
          const status = absencePercentage > failureThreshold ? 'NK' : 'OK';

          return {
            student,
            attendanceByLecture,
            absenceCount,
            totalLectures,
            absencePercentage,
            status
          };
        });
        
        console.log('Final registry rows generated:', registryRows.length);
      }
    }

    return NextResponse.json({
      programs: programs.map(p => ({ id: p.id.toString(), name: p.name })),
      classes,
      subjects,
      types,
      professors,
      lectures,
      students,
      attendance,
      registryRows
    });

  } catch (error) {
    console.error("Error fetching registry data:", error);
    return NextResponse.json(
      { error: "Failed to fetch registry data" },
      { status: 500 }
    );
  }
}