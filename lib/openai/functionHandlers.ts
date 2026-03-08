import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: resolve student by name search
async function resolveStudentByName(studentName: string) {
  const trimmed = studentName.trim();
  const nameParts = trimmed.split(/\s+/);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereConditions: any[] = [
    { firstName: { contains: trimmed } },
    { lastName: { contains: trimmed } },
  ];

  // If multiple words, also try first+last name combination
  if (nameParts.length >= 2) {
    whereConditions.push({
      AND: [
        { firstName: { contains: nameParts[0] } },
        { lastName: { contains: nameParts[nameParts.length - 1] } },
      ],
    });
  }

  return prisma.student.findMany({
    where: { OR: whereConditions },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      institutionEmail: true,
      class: { select: { name: true } },
    },
    take: 10,
  });
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

export async function getStudentDetails(params: { studentId?: number; email?: string; studentName?: string }) {
  let { studentId } = params;
  const { email, studentName } = params;

  if (!studentId && !email && !studentName) {
    throw new Error('Either studentId, email, or studentName must be provided');
  }

  // Resolve by name if needed
  if (!studentId && !email && studentName) {
    const candidates = await resolveStudentByName(studentName);
    if (candidates.length === 0) throw new Error(`No student found matching "${studentName}"`);
    if (candidates.length > 1) {
      return {
        multipleMatches: true,
        message: `Multiple students match "${studentName}". Please specify:`,
        candidates: candidates.map((c: typeof candidates[number]) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.institutionEmail,
          class: c.class.name,
        })),
      };
    }
    studentId = candidates[0].id;
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
        take: 50,
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Calculate attendance summary
  const allAttendance = await prisma.attendance.findMany({
    where: { studentId: student.id },
    include: { status: true },
  });
  const totalRecords = allAttendance.length;
  const presentCount = allAttendance.filter((a: typeof allAttendance[number]) => a.status.name === 'PRESENT').length;
  const absentCount = allAttendance.filter((a: typeof allAttendance[number]) => a.status.name === 'ABSENT').length;
  const participatedCount = allAttendance.filter((a: typeof allAttendance[number]) => a.status.name === 'PARTICIPATED').length;
  const leaveCount = allAttendance.filter((a: typeof allAttendance[number]) => a.status.name === 'LEAVE').length;
  const effectiveTotal = totalRecords - leaveCount;
  const attendancePercentage = effectiveTotal > 0 ? Math.round(((presentCount + participatedCount) / effectiveTotal) * 100) : 100;

  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.institutionEmail,
    class: student.class.name,
    program: student.class.program.name,
    summary: {
      totalRecords,
      present: presentCount,
      absent: absentCount,
      participated: participatedCount,
      leave: leaveCount,
      attendancePercentage,
    },
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
  typeName?: string;
}) {
  const { date, className, subjectName, professorId, typeName } = params;

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
        typeName
          ? {
              teachingAssignment: {
                type: {
                  name: { contains: typeName },
                },
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
  studentName?: string;
  className?: string;
  subjectName?: string;
  typeName?: string;
  startDate?: string;
  endDate?: string;
}) {
  let { studentId } = params;
  const { studentName, className, subjectName, typeName, startDate, endDate } = params;

  // Resolve student by name if needed
  if (!studentId && studentName) {
    const candidates = await resolveStudentByName(studentName);
    if (candidates.length === 0) throw new Error(`No student found matching "${studentName}"`);
    if (candidates.length > 1) {
      return {
        multipleMatches: true,
        message: `Multiple students match "${studentName}". Please specify:`,
        candidates: candidates.map((c: typeof candidates[number]) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.institutionEmail,
          class: c.class.name,
        })),
      };
    }
    studentId = candidates[0].id;
  }

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
        typeName
          ? {
              lecture: {
                teachingAssignment: {
                  type: {
                    name: { contains: typeName },
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
      student: { select: { firstName: true, lastName: true } },
      lecture: {
        include: {
          teachingAssignment: {
            include: {
              subject: true,
              type: true,
            },
          },
        },
      },
    },
  });

  // Calculate statistics
  const total = attendance.length;
  const present = attendance.filter((a: typeof attendance[number]) => a.status.name === 'PRESENT').length;
  const absent = attendance.filter((a: typeof attendance[number]) => a.status.name === 'ABSENT').length;
  const participated = attendance.filter((a: typeof attendance[number]) => a.status.name === 'PARTICIPATED').length;
  const leave = attendance.filter((a: typeof attendance[number]) => a.status.name === 'LEAVE').length;
  const effectiveTotal = total - leave;
  const attendancePercentage = effectiveTotal > 0 ? Math.round(((present + participated) / effectiveTotal) * 100) : 0;
  const absencePercentage = effectiveTotal > 0 ? Math.round((absent / effectiveTotal) * 100) : 0;

  return {
    total,
    present,
    absent,
    participated,
    leave,
    effectiveTotal,
    attendancePercentage,
    absencePercentage,
  };
}

// (Create, update, and delete operations removed)

// ============================================
// ADVANCED QUERY OPERATIONS
// ============================================

export async function getStudentAttendanceRecords(params: {
  studentName?: string;
  studentId?: number;
  className?: string;
  subjectName?: string;
  typeName?: string;
  statusFilter?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const { studentName, className, subjectName, typeName, statusFilter, startDate, endDate, limit = 100 } = params;
  let { studentId } = params;

  // Resolve student by name if needed
  let resolvedStudentName = '';
  if (studentName && !studentId) {
    const candidates = await resolveStudentByName(studentName);
    if (candidates.length === 0) throw new Error(`No student found matching "${studentName}"`);
    if (candidates.length > 1) {
      return {
        multipleMatches: true,
        message: `Multiple students match "${studentName}". Please specify:`,
        candidates: candidates.map((c: typeof candidates[number]) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.institutionEmail,
          class: c.class.name,
        })),
      };
    }
    studentId = candidates[0].id;
    resolvedStudentName = `${candidates[0].firstName} ${candidates[0].lastName}`;
  }

  const records = await prisma.attendance.findMany({
    where: {
      AND: [
        studentId ? { studentId } : {},
        statusFilter ? { status: { name: statusFilter.toUpperCase() } } : {},
        className
          ? { lecture: { teachingAssignment: { class: { name: { contains: className } } } } }
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
        typeName
          ? { lecture: { teachingAssignment: { type: { name: { contains: typeName } } } } }
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
      student: { select: { id: true, firstName: true, lastName: true } },
      status: true,
      lecture: {
        include: {
          teachingAssignment: {
            include: {
              subject: true,
              class: true,
              type: true,
            },
          },
        },
      },
    },
    orderBy: { lecture: { date: 'desc' } },
    take: limit,
  });

  return {
    studentName: resolvedStudentName || undefined,
    totalRecords: records.length,
    records: records.map((r: typeof records[number]) => ({
      date: r.lecture.date,
      subject: r.lecture.teachingAssignment.subject.name,
      class: r.lecture.teachingAssignment.class.name,
      type: r.lecture.teachingAssignment.type.name,
      status: r.status.name,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
    })),
  };
}

export async function getClassReport(params: {
  className: string;
  subjectName: string;
  typeName?: string;
}) {
  const { className, subjectName, typeName } = params;

  // Find class
  const classObj = await prisma.class.findFirst({
    where: { name: { contains: className } },
    include: {
      students: {
        select: { id: true, firstName: true, lastName: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      },
    },
  });

  if (!classObj) throw new Error(`Class "${className}" not found`);

  // Find subject
  const subject = await prisma.subject.findFirst({
    where: { OR: [{ name: { contains: subjectName } }, { code: { contains: subjectName } }] },
  });
  if (!subject) throw new Error(`Subject "${subjectName}" not found`);

  // Find teaching assignments
  const assignments = await prisma.teachingAssignment.findMany({
    where: {
      classId: classObj.id,
      subjectId: subject.id,
      ...(typeName ? { type: { name: { contains: typeName } } } : {}),
    },
    include: { type: true, professor: true },
  });

  if (assignments.length === 0) {
    throw new Error(
      `No teaching assignment found for "${subject.name}" in class "${classObj.name}"${typeName ? ` for type "${typeName}"` : ''}`
    );
  }

  // Get all lectures for these assignments
  const lectures = await prisma.lecture.findMany({
    where: {
      teachingAssignmentId: { in: assignments.map((a: typeof assignments[number]) => a.id) },
    },
    include: {
      attendance: {
        include: { status: true },
      },
      teachingAssignment: {
        include: { type: true },
      },
    },
    orderBy: { date: 'asc' },
  });

  const totalLectures = lectures.length;
  const typeNames = [...new Set(assignments.map((a: typeof assignments[number]) => a.type.name))];
  const isSeminarOnly = typeNames.length === 1 && typeNames[0] === 'Seminar';
  const threshold = isSeminarOnly ? 75 : 50;

  // Calculate per-student statistics
  const studentResults = classObj.students.map((student: typeof classObj.students[number]) => {
    let attended = 0;
    let absent = 0;
    let participated = 0;
    let leave = 0;
    let effectiveTotal = totalLectures;

    lectures.forEach((lecture: typeof lectures[number]) => {
      const att = lecture.attendance.find(
        (a: typeof lecture.attendance[number]) => a.studentId === student.id
      );
      if (att) {
        switch (att.status.name) {
          case 'PRESENT':
            attended++;
            break;
          case 'PARTICIPATED':
            attended++;
            participated++;
            break;
          case 'ABSENT':
            absent++;
            break;
          case 'LEAVE':
            leave++;
            effectiveTotal--;
            break;
        }
      } else {
        // No attendance record = absent
        absent++;
      }
    });

    const percentage = effectiveTotal > 0 ? Math.round((attended / effectiveTotal) * 100) : 100;
    const passed = percentage >= threshold;

    return {
      name: `${student.firstName} ${student.lastName}`,
      totalLectures: effectiveTotal,
      attended,
      absent,
      participated,
      leave,
      attendancePercentage: percentage,
      status: passed ? 'OK' : 'NK',
    };
  });

  const nkStudents = studentResults.filter((s: typeof studentResults[number]) => s.status === 'NK');
  const okStudents = studentResults.filter((s: typeof studentResults[number]) => s.status === 'OK');

  return {
    class: classObj.name,
    subject: subject.name,
    types: typeNames.join(', '),
    totalLectures,
    totalStudents: classObj.students.length,
    nkCount: nkStudents.length,
    okCount: okStudents.length,
    threshold: `${threshold}%`,
    students: studentResults,
  };
}
