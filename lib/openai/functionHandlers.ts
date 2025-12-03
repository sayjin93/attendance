import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface User {
  professorId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

/**
 * Function handlers that execute the actual database operations
 * These are called when OpenAI decides to use a function
 */

// ============================================
// QUERY/READ OPERATIONS
// ============================================

export async function getSystemStatistics() {
  const [studentsCount, professorsCount, classesCount, subjectsCount, todayLectures] = await Promise.all([
    prisma.student.count(),
    prisma.professor.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.lecture.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  return {
    students: studentsCount,
    professors: professorsCount,
    classes: classesCount,
    subjects: subjectsCount,
    todayLectures,
  };
}

export async function getStudents(params: {
  className?: string;
  searchQuery?: string;
  limit?: number;
}) {
  const { className, searchQuery, limit = 50 } = params;

  const students = await prisma.student.findMany({
    where: {
      AND: [
        className
          ? {
              class: {
                name: { contains: className },
              },
            }
          : {},
        searchQuery
          ? {
              OR: [
                { firstName: { contains: searchQuery } },
                { lastName: { contains: searchQuery } },
                { institutionEmail: { contains: searchQuery } },
                { personalEmail: { contains: searchQuery } },
              ],
            }
          : {},
      ],
    },
    include: {
      class: {
        include: {
          program: true,
        },
      },
    },
    take: limit,
  });

  return students.map((s: typeof students[number]) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.institutionEmail,
    class: s.class.name,
    program: s.class.program.name,
  }));
}

export async function getStudentDetails(params: { studentId?: number; email?: string }) {
  const { studentId, email } = params;

  if (!studentId && !email) {
    throw new Error('Either studentId or email must be provided');
  }

  const student = await prisma.student.findFirst({
    where: studentId ? { id: studentId } : { institutionEmail: email },
    include: {
      class: {
        include: {
          program: true,
        },
      },
      attendance: {
        include: {
          lecture: {
            include: {
              teachingAssignment: {
                include: {
                  subject: true,
                },
              },
            },
          },
          status: true,
        },
        orderBy: {
          lecture: {
            date: 'desc',
          },
        },
        take: 20,
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.institutionEmail,
    class: student.class.name,
    program: student.class.program.name,
    recentAttendance: student.attendance.map((a: typeof student.attendance[number]) => ({
      id: a.id,
      date: a.lecture.date,
      subject: a.lecture.teachingAssignment.subject.name,
      status: a.status.name,
    })),
  };
}

export async function getClasses(params: { programName?: string }) {
  const { programName } = params;

  const classes = await prisma.class.findMany({
    where: programName
      ? {
          program: {
            name: { contains: programName },
          },
        }
      : {},
    include: {
      program: true,
      _count: {
        select: {
          students: true,
        },
      },
    },
  });

  return classes.map((c: typeof classes[number]) => ({
    id: c.id,
    name: c.name,
    program: c.program.name,
    studentsCount: c._count.students,
  }));
}

export async function getClassDetails(params: { className?: string; classId?: number }) {
  const { className, classId } = params;

  if (!className && !classId) {
    throw new Error('Either className or classId must be provided');
  }

  const classData = await prisma.class.findFirst({
    where: classId ? { id: classId } : { name: { contains: className } },
    include: {
      program: true,
      students: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          institutionEmail: true,
        },
        take: 100,
      },
      teachingAssignments: {
        include: {
          subject: true,
          professor: true,
          type: true,
        },
      },
    },
  });

  if (!classData) {
    throw new Error('Class not found');
  }

  return {
    id: classData.id,
    name: classData.name,
    program: classData.program.name,
    studentsCount: classData.students.length,
    students: classData.students,
    subjects: classData.teachingAssignments.map((ta: typeof classData.teachingAssignments[number]) => ({
      subject: ta.subject.name,
      code: ta.subject.code,
      professor: `${ta.professor.firstName} ${ta.professor.lastName}`,
      type: ta.type.name,
    })),
  };
}

export async function getSubjects(params: { searchQuery?: string }) {
  const { searchQuery } = params;

  const subjects = await prisma.subject.findMany({
    where: searchQuery
      ? {
          OR: [{ name: { contains: searchQuery } }, { code: { contains: searchQuery } }],
        }
      : {},
    include: {
      _count: {
        select: {
          teachingAssignments: true,
        },
      },
    },
  });

  return subjects.map((s: typeof subjects[number]) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    assignmentsCount: s._count.teachingAssignments,
  }));
}

export async function getProfessors(params: { searchQuery?: string }) {
  const { searchQuery } = params;

  const professors = await prisma.professor.findMany({
    where: searchQuery
      ? {
          OR: [
            { firstName: { contains: searchQuery } },
            { lastName: { contains: searchQuery } },
            { email: { contains: searchQuery } },
          ],
        }
      : {},
    include: {
      _count: {
        select: {
          teachingAssignments: true,
        },
      },
    },
  });

  return professors.map((p: typeof professors[number]) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    isAdmin: p.isAdmin,
    teachingAssignmentsCount: p._count.teachingAssignments,
  }));
}

export async function getLectures(params: {
  date?: string;
  className?: string;
  subjectName?: string;
  professorId?: number;
}) {
  const { date, className, subjectName, professorId } = params;

  const lectures = await prisma.lecture.findMany({
    where: {
      AND: [
        date
          ? {
              date: {
                gte: new Date(date),
                lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
              },
            }
          : {},
        className
          ? {
              teachingAssignment: {
                class: {
                  name: { contains: className },
                },
              },
            }
          : {},
        subjectName
          ? {
              teachingAssignment: {
                subject: {
                  OR: [{ name: { contains: subjectName } }, { code: { contains: subjectName } }],
                },
              },
            }
          : {},
        professorId
          ? {
              teachingAssignment: {
                professorId,
              },
            }
          : {},
      ],
    },
    include: {
      teachingAssignment: {
        include: {
          subject: true,
          class: true,
          professor: true,
          type: true,
        },
      },
      _count: {
        select: {
          attendance: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 50,
  });

  return lectures.map((l: typeof lectures[number]) => ({
    id: l.id,
    date: l.date,
    subject: l.teachingAssignment.subject.name,
    class: l.teachingAssignment.class.name,
    professor: `${l.teachingAssignment.professor.firstName} ${l.teachingAssignment.professor.lastName}`,
    type: l.teachingAssignment.type.name,
    attendanceCount: l._count.attendance,
  }));
}

export async function getLectureAttendance(params: { lectureId: number }) {
  const { lectureId } = params;

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    include: {
      teachingAssignment: {
        include: {
          subject: true,
          class: true,
        },
      },
      attendance: {
        include: {
          student: true,
          status: true,
        },
      },
    },
  });

  if (!lecture) {
    throw new Error('Lecture not found');
  }

  return {
    lectureId: lecture.id,
    date: lecture.date,
    subject: lecture.teachingAssignment.subject.name,
    class: lecture.teachingAssignment.class.name,
    attendance: lecture.attendance.map((a: typeof lecture.attendance[number]) => ({
      id: a.id,
      student: `${a.student.firstName} ${a.student.lastName}`,
      email: a.student.institutionEmail,
      status: a.status.name,
    })),
  };
}

export async function getAttendanceStatistics(params: {
  studentId?: number;
  className?: string;
  subjectName?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { studentId, className, subjectName, startDate, endDate } = params;

  const attendance = await prisma.attendance.findMany({
    where: {
      AND: [
        studentId ? { studentId } : {},
        className
          ? {
              lecture: {
                teachingAssignment: {
                  class: {
                    name: { contains: className },
                  },
                },
              },
            }
          : {},
        subjectName
          ? {
              lecture: {
                teachingAssignment: {
                  subject: {
                    OR: [{ name: { contains: subjectName } }, { code: { contains: subjectName } }],
                  },
                },
              },
            }
          : {},
        startDate || endDate
          ? {
              lecture: {
                date: {
                  ...(startDate && { gte: new Date(startDate) }),
                  ...(endDate && { lte: new Date(endDate) }),
                },
              },
            }
          : {},
      ],
    },
    include: {
      status: true,
      lecture: {
        include: {
          teachingAssignment: {
            include: {
              subject: true,
            },
          },
        },
      },
    },
  });

  // Calculate statistics
  const stats = {
    total: attendance.length,
    present: attendance.filter((a: typeof attendance[number]) => a.status.name === 'Present').length,
    absent: attendance.filter((a: typeof attendance[number]) => a.status.name === 'Absent').length,
    late: attendance.filter((a: typeof attendance[number]) => a.status.name === 'Late').length,
    excused: attendance.filter((a: typeof attendance[number]) => a.status.name === 'Excused').length,
    percentage: 0,
  };

  stats.percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return stats;
}

// ============================================
// CREATE OPERATIONS
// ============================================

export async function createLecture(
  params: {
    subjectName: string;
    className: string;
    date: string;
  },
  user: User
) {
  const { subjectName, className, date } = params;

  // Find the class
  const classObj = await prisma.class.findFirst({
    where: {
      name: { contains: className },
    },
  });

  if (!classObj) {
    throw new Error(`Class "${className}" not found`);
  }

  // Find the subject
  const subject = await prisma.subject.findFirst({
    where: {
      OR: [{ name: { contains: subjectName } }, { code: { contains: subjectName } }],
    },
  });

  if (!subject) {
    throw new Error(`Subject "${subjectName}" not found`);
  }

  // Find teaching assignment
  const assignment = await prisma.teachingAssignment.findFirst({
    where: {
      subjectId: subject.id,
      classId: classObj.id,
      ...(user.isAdmin ? {} : { professorId: user.professorId }),
    },
    include: { subject: true, class: true, type: true },
  });

  if (!assignment) {
    if (user.isAdmin) {
      throw new Error(
        `No teaching assignment found for "${subject.name}" in class "${classObj.name}". Please create a teaching assignment first.`
      );
    } else {
      throw new Error(
        `You don't have a teaching assignment for "${subject.name}" in class "${classObj.name}".`
      );
    }
  }

  const lectureDate = new Date(date);

  const lecture = await prisma.lecture.create({
    data: {
      teachingAssignmentId: assignment.id,
      date: lectureDate,
    },
    include: {
      teachingAssignment: {
        include: { subject: true, class: true },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'lectures',
      entityId: lecture.id,
      details: JSON.stringify({
        subject: assignment.subject.name,
        class: assignment.class.name,
        date: lectureDate.toISOString(),
      }),
      ipAddress: 'AI_AGENT',
    },
  });

  return {
    success: true,
    lectureId: lecture.id,
    subject: assignment.subject.name,
    class: assignment.class.name,
    date: lectureDate.toISOString(),
    message: `Lecture created successfully for ${assignment.subject.name} in ${assignment.class.name} on ${lectureDate.toLocaleDateString()}`,
  };
}

export async function markAttendance(
  params: {
    studentEmail: string;
    status: string;
    lectureId?: number;
    subjectName?: string;
    className?: string;
    date?: string;
  },
  user: User
) {
  const { studentEmail, status, lectureId, subjectName, className, date } = params;

  // Find student
  const student = await prisma.student.findFirst({
    where: { institutionEmail: studentEmail },
  });

  if (!student) {
    throw new Error(`Student with email "${studentEmail}" not found`);
  }

  // Find lecture
  let lecture;
  if (lectureId) {
    lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        teachingAssignment: {
          include: { subject: true, class: true },
        },
      },
    });
  } else if (subjectName && className && date) {
    // Find by subject, class, and date
    const lectureDate = new Date(date);
    lecture = await prisma.lecture.findFirst({
      where: {
        date: {
          gte: new Date(lectureDate.setHours(0, 0, 0, 0)),
          lt: new Date(lectureDate.setHours(23, 59, 59, 999)),
        },
        teachingAssignment: {
          subject: {
            OR: [{ name: { contains: subjectName } }, { code: { contains: subjectName } }],
          },
          class: {
            name: { contains: className },
          },
        },
      },
      include: {
        teachingAssignment: {
          include: { subject: true, class: true },
        },
      },
    });
  } else {
    throw new Error('Either lectureId or (subjectName, className, date) must be provided');
  }

  if (!lecture) {
    throw new Error('Lecture not found');
  }

  // Find attendance status
  const attendanceStatus = await prisma.attendanceStatus.findFirst({
    where: {
      name: {
        equals: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        mode: 'insensitive',
      },
    },
  });

  if (!attendanceStatus) {
    throw new Error(`Invalid attendance status: ${status}`);
  }

  // Check if attendance already exists
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      studentId: student.id,
      lectureId: lecture.id,
    },
  });

  let attendance;
  if (existingAttendance) {
    // Update existing
    attendance = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: { statusId: attendanceStatus.id },
      include: {
        student: true,
        status: true,
        lecture: {
          include: {
            teachingAssignment: {
              include: { subject: true, class: true },
            },
          },
        },
      },
    });
  } else {
    // Create new
    attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        lectureId: lecture.id,
        statusId: attendanceStatus.id,
      },
      include: {
        student: true,
        status: true,
        lecture: {
          include: {
            teachingAssignment: {
              include: { subject: true, class: true },
            },
          },
        },
      },
    });
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: existingAttendance ? 'UPDATE' : 'CREATE',
      entity: 'attendance',
      entityId: attendance.id,
      details: JSON.stringify({
        student: `${student.firstName} ${student.lastName}`,
        status: attendanceStatus.name,
        subject: lecture.teachingAssignment.subject.name,
        class: lecture.teachingAssignment.class.name,
        date: lecture.date,
      }),
      ipAddress: 'AI_AGENT',
    },
  });

  return {
    success: true,
    attendanceId: attendance.id,
    student: `${student.firstName} ${student.lastName}`,
    status: attendanceStatus.name,
    subject: lecture.teachingAssignment.subject.name,
    class: lecture.teachingAssignment.class.name,
    date: lecture.date,
    message: `Attendance ${existingAttendance ? 'updated' : 'marked'} successfully for ${student.firstName} ${student.lastName} as ${attendanceStatus.name}`,
  };
}

// ============================================
// UPDATE OPERATIONS
// ============================================

export async function updateAttendance(
  params: {
    attendanceId: number;
    status: string;
  },
  user: User
) {
  const { attendanceId, status } = params;

  // Find attendance status
  const attendanceStatus = await prisma.attendanceStatus.findFirst({
    where: {
      name: {
        equals: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        mode: 'insensitive',
      },
    },
  });

  if (!attendanceStatus) {
    throw new Error(`Invalid attendance status: ${status}`);
  }

  const attendance = await prisma.attendance.update({
    where: { id: attendanceId },
    data: { statusId: attendanceStatus.id },
    include: {
      student: true,
      status: true,
      lecture: {
        include: {
          teachingAssignment: {
            include: { subject: true, class: true },
          },
        },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'UPDATE',
      entity: 'attendance',
      entityId: attendance.id,
      details: JSON.stringify({
        student: `${attendance.student.firstName} ${attendance.student.lastName}`,
        newStatus: attendanceStatus.name,
      }),
      ipAddress: 'AI_AGENT',
    },
  });

  return {
    success: true,
    attendanceId: attendance.id,
    student: `${attendance.student.firstName} ${attendance.student.lastName}`,
    newStatus: attendanceStatus.name,
    message: `Attendance updated successfully to ${attendanceStatus.name}`,
  };
}

// ============================================
// DELETE OPERATIONS
// ============================================

export async function deleteLecture(params: { lectureId: number }, user: User) {
  const { lectureId } = params;

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    include: {
      teachingAssignment: {
        include: { subject: true, class: true },
      },
      _count: {
        select: {
          attendance: true,
        },
      },
    },
  });

  if (!lecture) {
    throw new Error('Lecture not found');
  }

  // Delete lecture (cascade will delete attendance records)
  await prisma.lecture.delete({
    where: { id: lectureId },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'DELETE',
      entity: 'lectures',
      entityId: lectureId,
      details: JSON.stringify({
        subject: lecture.teachingAssignment.subject.name,
        class: lecture.teachingAssignment.class.name,
        date: lecture.date,
        attendanceRecordsDeleted: lecture._count.attendance,
      }),
      ipAddress: 'AI_AGENT',
    },
  });

  return {
    success: true,
    message: `Lecture deleted successfully (${lecture._count.attendance} attendance records also removed)`,
    subject: lecture.teachingAssignment.subject.name,
    class: lecture.teachingAssignment.class.name,
    date: lecture.date,
  };
}
