import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { SECRET_KEY } from '@/constants';

const prisma = new PrismaClient();

interface User {
  professorId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

// Permission checking
async function checkPermission(
  user: User,
  action: 'create' | 'read' | 'update' | 'delete',
  entity: string
): Promise<boolean> {
  if (user.isAdmin) return true;

  const adminOnlyEntities = ['student', 'professor', 'class', 'subject', 'program', 'teaching-assignment'];
  
  if (adminOnlyEntities.includes(entity)) {
    return action === 'read';
  }

  return true; // For lectures and attendance
}

// Activity logging
async function logActivity(params: {
  userId: number;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId?: number;
  details?: Record<string, unknown>;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: 'WEB_UI',
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// AI Agent processor
async function processAIRequest(message: string, user: User): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  console.log('[AI Agent] Processing request:', { message, lowerMessage, user: user.professorId });

  // ============================================
  // CREATE OPERATIONS
  // ============================================

  // Create lecture
  if ((lowerMessage.includes('create') || lowerMessage.includes('krijo') || lowerMessage.includes('add') || lowerMessage.includes('shto')) && lowerMessage.includes('lecture')) {
    // Parse: "create lecture for Web Development in class Infoek202 tomorrow"
    const dateMatch = message.match(/(\d{4}-\d{2}-\d{2})|today|tomorrow|sot|nesër/i);
    
    if (!dateMatch) {
      return 'Ju lutem specifikoni një datë. Shembull: "Krijo leksion për Web Development në klasën Infoek202 nesër" ose "Create lecture for CIS280 in Infoek202 tomorrow"';
    }

    let lectureDate = new Date();
    const dateStr = dateMatch[0].toLowerCase();
    if (dateStr === 'today' || dateStr === 'sot') {
      lectureDate = new Date();
    } else if (dateStr === 'tomorrow' || dateStr === 'nesër') {
      lectureDate = new Date();
      lectureDate.setDate(lectureDate.getDate() + 1);
    } else {
      lectureDate = new Date(dateMatch[0]);
    }

    // Try to extract subject and class names
    // Match patterns like "for [subject] in [class]" or "për [subject] në [class]"
    const subjectClassMatch = message.match(/(?:for|për)\s+([\w\s]+?)\s+(?:in|në|class|klasën|klases)\s+([\w\d]+)/i);
    
    if (!subjectClassMatch) {
      return 'Ju lutem specifikoni lëndën dhe klasën. Shembull: "Krijo leksion për Web Development në klasën Infoek202 nesër"';
    }

    const subjectName = subjectClassMatch[1].trim();
    const className = subjectClassMatch[2].trim();

    // Find the class
    const classObj = await prisma.class.findFirst({
      where: {
        name: {
          contains: className
        }
      }
    });

    if (!classObj) {
      return `Klasa "${className}" nuk u gjet. Ju lutem kontrolloni emrin e klasës.`;
    }

    // Find the subject
    const subject = await prisma.subject.findFirst({
      where: {
        OR: [
          { name: { contains: subjectName } },
          { code: { contains: subjectName } }
        ]
      }
    });

    if (!subject) {
      return `Lënda "${subjectName}" nuk u gjet. Ju lutem kontrolloni emrin ose kodin e lëndës.`;
    }

    // Find teaching assignment
    const assignment = await prisma.teachingAssignment.findFirst({
      where: {
        subjectId: subject.id,
        classId: classObj.id,
        professorId: user.isAdmin ? undefined : user.professorId
      },
      include: { subject: true, class: true, type: true }
    });

    if (!assignment) {
      if (user.isAdmin) {
        return `Nuk u gjet caktim mësimor për "${subject.name}" në klasën "${classObj.name}". Ju lutem krijoni fillimisht caktimin mësimor.`;
      } else {
        return `Ju nuk keni caktim mësimor për "${subject.name}" në klasën "${classObj.name}".`;
      }
    }

    const lecture = await prisma.lecture.create({
      data: {
        teachingAssignmentId: assignment.id,
        date: lectureDate
      },
      include: {
        teachingAssignment: {
          include: { subject: true, class: true }
        }
      }
    });

    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'lectures',
      entityId: lecture.id,
      details: {
        subject: assignment.subject.name,
        class: assignment.class.name,
        date: lectureDate.toISOString()
      }
    });

    return `✅ Leksioni u krijua me sukses!\n\nLënda: ${assignment.subject.name}\nKlasa: ${assignment.class.name}\nData: ${lectureDate.toLocaleDateString()}\nLeksion ID: ${lecture.id}`;
  }

  // Mark attendance
  if ((lowerMessage.includes('mark') || lowerMessage.includes('shëno') || lowerMessage.includes('record')) && lowerMessage.includes('attendance')) {
    // Parse: "mark attendance for john.doe@example.com in today's Web Development lecture as present"
    // Extract student identifier (email or name)
    const emailMatch = message.match(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i);
    const studentNameMatch = message.match(/(?:for|p\u00ebr)\s+([\w\s]+?)\s+(?:in|n\u00eb|lecture|leksion)/i);
    const statusMatch = message.match(/\b(present|absent|late|excused|pr\u00ebsent\u00eb|munges\u00eb|von\u00eb)\b/i);

    // Extract lecture details (subject, class, date)
    const dateMatch = message.match(/(today|tomorrow|yesterday|sot|nesër|dje|\d{4}-\d{2}-\d{2})/i);
    const subjectClassMatch = message.match(/(?:in|në)\s+(?:lecture|leksion)?\s*([\w\s]+?)\s+(?:in|në|class|klasën|klases)?\s+([\w\d]+)/i);

    if (!emailMatch && !studentNameMatch) {
      return 'Ju lutem specifikoni studentin (email ose emër). Shembull: "Shëno prezentë për john.doe@example.com në leksionin e Web Development sot" ose "Mark John Doe present in Web Development lecture today"';
    }

    if (!dateMatch) {
      return 'Ju lutem specifikoni datën e leksionit (sot, nesër, dje). Shembull: "Shëno prezentë për john.doe@example.com në leksionin e Web Development sot"';
    }

    // Determine lecture date
    let lectureDate = new Date();
    const dateStr = dateMatch[0].toLowerCase();
    if (dateStr === 'today' || dateStr === 'sot') {
      lectureDate.setHours(0, 0, 0, 0);
    } else if (dateStr === 'tomorrow' || dateStr === 'nes\u00ebr') {
      lectureDate.setDate(lectureDate.getDate() + 1);
      lectureDate.setHours(0, 0, 0, 0);
    } else if (dateStr === 'yesterday' || dateStr === 'dje') {
      lectureDate.setDate(lectureDate.getDate() - 1);
      lectureDate.setHours(0, 0, 0, 0);
    } else {
      lectureDate = new Date(dateMatch[0]);
      lectureDate.setHours(0, 0, 0, 0);
    }

    // Find student
    let student = null;
    if (emailMatch) {
      student = await prisma.student.findUnique({ where: { email: emailMatch[1] } });
      if (!student) {
        return `Studenti me email \"${emailMatch[1]}\" nuk u gjet.`;
      }
    } else if (studentNameMatch) {
      const studentName = studentNameMatch[1].trim();
      const nameParts = studentName.split(/\s+/);
      
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { 
              AND: [
                { firstName: { contains: nameParts[0] } },
                nameParts.length > 1 ? { lastName: { contains: nameParts[nameParts.length - 1] } } : {}
              ]
            },
            { firstName: { contains: studentName } },
            { lastName: { contains: studentName } }
          ]
        }
      });

      if (!student) {
        return `Studenti \"${studentName}\" nuk u gjet.`;
      }
    }

    // Find lecture - if subject and class specified, search by those
    let lecture = null;
    if (subjectClassMatch) {
      const subjectName = subjectClassMatch[1].trim();
      const className = subjectClassMatch[2].trim();

      // Find subject
      const subject = await prisma.subject.findFirst({
        where: {
          OR: [
            { name: { contains: subjectName } },
            { code: { contains: subjectName } }
          ]
        }
      });

      // Find class
      const classObj = await prisma.class.findFirst({
        where: { name: { contains: className } }
      });

      if (subject && classObj) {
        lecture = await prisma.lecture.findFirst({
          where: {
            date: {
              gte: lectureDate,
              lt: new Date(lectureDate.getTime() + 24 * 60 * 60 * 1000)
            },
            teachingAssignment: {
              subjectId: subject.id,
              classId: classObj.id,
              professorId: user.isAdmin ? undefined : user.professorId
            }
          },
          include: {
            teachingAssignment: {
              include: { subject: true, class: true }
            }
          }
        });
      }
    } else {
      // Just search by date and student's class
      lecture = await prisma.lecture.findFirst({
        where: {
          date: {
            gte: lectureDate,
            lt: new Date(lectureDate.getTime() + 24 * 60 * 60 * 1000)
          },
          teachingAssignment: {
            classId: student?.classId,
            professorId: user.isAdmin ? undefined : user.professorId
          }
        },
        include: {
          teachingAssignment: {
            include: { subject: true, class: true }
          }
        }
      });
    }

    if (!lecture) {
      return `Leksioni nuk u gjet për datën e specifikuar. Sigurohuni që leksioni ekziston.`;
    }

    // Verify student is in the lecture's class
    if (student?.classId !== lecture.teachingAssignment.classId) {
      return `Studenti "${student?.firstName} ${student?.lastName}" nuk është në klasën "${lecture.teachingAssignment.class.name}".`;
    }
    
    // Determine status
    let statusId = 1; // Default: Present
    if (statusMatch) {
      const statusName = statusMatch[1].toLowerCase();
      const statuses = await prisma.attendanceStatus.findMany();
      const status = statuses.find((s: typeof statuses[0]) => 
        s.name.toLowerCase() === statusName || 
        (statusName === 'prezentë' && s.name.toLowerCase() === 'present') ||
        (statusName === 'mungesë' && s.name.toLowerCase() === 'absent') ||
        (statusName === 'vonë' && s.name.toLowerCase() === 'late')
      );
      if (status) statusId = status.id;
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_lectureId: { studentId: student!.id, lectureId: lecture.id }
      },
      update: { statusId },
      create: { studentId: student!.id, lectureId: lecture.id, statusId },
      include: { status: true }
    });

    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'attendance',
      entityId: attendance.id,
      details: {
        student: `${student!.firstName} ${student!.lastName}`,
        lecture: `${lecture.teachingAssignment.subject.name} - ${lecture.teachingAssignment.class.name}`,
        date: lectureDate.toISOString(),
        status: attendance.status.name
      }
    });

    return `✅ Prania u shënua me sukses!\n\nStudenti: ${student!.firstName} ${student!.lastName}\nLënda: ${lecture.teachingAssignment.subject.name}\nKlasa: ${lecture.teachingAssignment.class.name}\nData: ${lectureDate.toLocaleDateString()}\nStatusi: ${attendance.status.name}`;
  }

  // Create student (Admin only)
  if ((lowerMessage.includes('create') || lowerMessage.includes('add')) && lowerMessage.includes('student')) {
    if (!user.isAdmin) {
      return '❌ Only administrators can create students.';
    }

    return 'To create a student, please provide:\n- First name\n- Last name\n- Institution email\n- Class ID\n\nExample: "Create student John Doe with email john@example.com in class 1"\n\n(Note: For complex creations, please use the Students page in the UI)';
  }

  // ============================================
  // READ OPERATIONS
  // ============================================
  
  // List students
  if ((lowerMessage.includes('list') || lowerMessage.includes('listo') || lowerMessage.includes('show')) && lowerMessage.includes('student')) {
    console.log('[AI Agent] Processing student list request:', message);
    
    const hasPermission = await checkPermission(user, 'read', 'student');
    if (!hasPermission) {
      return 'Sorry, you do not have permission to view students.';
    }

    // Try to match class name - improved regex to capture more patterns
    // Matches: "in Infoek202", "në klasën Infoek202", "klases Infoek202", "class Infoek202"
    const classNameMatch = message.match(/(?:in|në|class|klase[sn]?|klasën)\s+([a-zA-Z0-9]+)/i);
    console.log('[AI Agent] Class name match:', classNameMatch);
    
    let whereClause = {};
    let classIdentifier = '';
    
    if (classNameMatch) {
      const className = classNameMatch[1];
      console.log('[AI Agent] Looking for class:', className);
      
      // Find class by name
      const matchingClass = await prisma.class.findFirst({
        where: {
          name: {
            contains: className
          }
        }
      });
      
      console.log('[AI Agent] Found class:', matchingClass);
      
      if (matchingClass) {
        whereClause = { classId: matchingClass.id };
        classIdentifier = `class ${matchingClass.name}`;
      } else {
        return `Klasa "${className}" nuk u gjet. Ju lutem kontrolloni emrin e klasës dhe provoni përsëri.`;
      }
    }

    console.log('[AI Agent] Where clause:', whereClause);

    const students = await prisma.student.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        class: {
          include: { program: true },
        },
      },
      take: 50,
      orderBy: { orderId: 'asc' },
    });

    console.log('[AI Agent] Found students:', students.length);

    if (students.length === 0) {
      return classIdentifier 
        ? `Nuk u gjetën studentë në ${classIdentifier}.`
        : 'Nuk u gjetën studentë në sistem.';
    }

    const studentList = students
      .map(
        (s: typeof students[0], idx: number) =>
          `${idx + 1}. ${s.firstName} ${s.lastName} - ${s.class.name} (${s.class.program.name}) - ${s.institutionEmail}`
      )
      .join('\n');

    // Log the query
    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'ai-query',
      details: { 
        query: 'list_students', 
        classFilter: classIdentifier || 'all',
        resultCount: students.length 
      }
    });

    const response = `U gjetën ${students.length} student(ë)${classIdentifier ? ` në ${classIdentifier}` : ''}:\n\n${studentList}`;
    console.log('[AI Agent] Response length:', response.length);
    return response;
  }

  // List lectures
  if (lowerMessage.includes('lecture')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateFilter = {};
    
    if (lowerMessage.includes('today')) {
      dateFilter = {
        date: {
          gte: today,
          lt: tomorrow,
        },
      };
    } else if (lowerMessage.includes('tomorrow')) {
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      dateFilter = {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      };
    } else if (lowerMessage.includes('week')) {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = {
        date: {
          gte: weekAgo,
          lte: today,
        },
      };
    }

    const lectures = await prisma.lecture.findMany({
      where: {
        ...dateFilter,
        teachingAssignment: user.isAdmin ? undefined : {
          professorId: user.professorId,
        },
      },
      include: {
        teachingAssignment: {
          include: {
            professor: true,
            subject: true,
            class: true,
            type: true,
          },
        },
        _count: {
          select: { attendance: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    if (lectures.length === 0) {
      return 'No lectures found matching your criteria.';
    }

    const lectureList = lectures
      .map((l: typeof lectures[0], idx: number) => {
        const date = new Date(l.date).toLocaleDateString();
        const prof = `${l.teachingAssignment.professor.firstName} ${l.teachingAssignment.professor.lastName}`;
        return `${idx + 1}. ${l.teachingAssignment.subject.name} - ${l.teachingAssignment.class.name} (${date}) - Prof. ${prof} - ${l._count.attendance} attendance records`;
      })
      .join('\n');

    // Log the query
    const timeFilter = lowerMessage.includes('today') ? 'today' : 
                       lowerMessage.includes('tomorrow') ? 'tomorrow' : 
                       lowerMessage.includes('week') ? 'week' : 'all';
    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'ai-query',
      details: { query: 'list_lectures', timeFilter, resultCount: lectures.length }
    });

    return `Found ${lectures.length} lecture(s):\n\n${lectureList}`;
  }

  // Show statistics
  if (lowerMessage.includes('statistic') || lowerMessage.includes('overview') || lowerMessage.includes('summary')) {
    const [studentCount, professorCount, classCount, subjectCount, lectureCount, attendanceCount] = await Promise.all([
      prisma.student.count(),
      prisma.professor.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.lecture.count(),
      prisma.attendance.count(),
    ]);

    // Log the query
    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'ai-query',
      details: { 
        query: 'system_statistics',
        stats: { studentCount, professorCount, classCount, subjectCount, lectureCount, attendanceCount }
      }
    });

    return `📊 **System Statistics:**\n\n` +
      `👨‍🎓 Students: ${studentCount}\n` +
      `👨‍🏫 Professors: ${professorCount}\n` +
      `🏫 Classes: ${classCount}\n` +
      `📚 Subjects: ${subjectCount}\n` +
      `📖 Lectures: ${lectureCount}\n` +
      `✅ Attendance Records: ${attendanceCount}`;
  }

  // List professors
  if (lowerMessage.includes('professor')) {
    const professors = await prisma.professor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        _count: {
          select: { teachingAssignments: true },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    const profList = professors
      .map(
        (p: typeof professors[0], idx: number) =>
          `${idx + 1}. ${p.firstName} ${p.lastName} - ${p.email}${p.isAdmin ? ' (Admin)' : ''} - ${p._count.teachingAssignments} assignments`
      )
      .join('\n');

    // Log the query
    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'ai-query',
      details: { query: 'list_professors', resultCount: professors.length }
    });

    return `Found ${professors.length} professor(s):\n\n${profList}`;
  }

  // List classes
  if (lowerMessage.includes('class') && !lowerMessage.includes('student')) {
    const classes = await prisma.class.findMany({
      include: {
        program: true,
        _count: {
          select: { students: true, teachingAssignments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const classList = classes
      .map(
        (c: typeof classes[0], idx: number) =>
          `${idx + 1}. ${c.name} (${c.program.name}) - ${c._count.students} students, ${c._count.teachingAssignments} subjects`
      )
      .join('\n');

    // Log the query
    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'ai-query',
      details: { query: 'list_classes', resultCount: classes.length }
    });

    return `Found ${classes.length} class(es):\n\n${classList}`;
  }

  // ============================================
  // DELETE OPERATIONS
  // ============================================

  // Delete lecture
  if ((lowerMessage.includes('delete') || lowerMessage.includes('fshi') || lowerMessage.includes('remove')) && lowerMessage.includes('lecture')) {
    // Parse: "delete Web Development lecture for Infoek202 from yesterday" or "fshi leksionin e CIS280 në Infoek202 nga dje"
    const dateMatch = message.match(/(today|tomorrow|yesterday|sot|nesër|dje|\d{4}-\d{2}-\d{2})/i);
    const subjectClassMatch = message.match(/(?:lecture|leksion)\s+(?:for|për|e)?\s*([\w\s]+?)\s+(?:for|për|në|in|class|klasën)?\s+([\w\d]+)/i);
    
    if (!dateMatch) {
      return 'Ju lutem specifikoni dat\u00ebn. Shembull: \"Fshi leksionin e Web Development p\u00ebr Infoek202 nga dje\" ose \"Delete Web Development lecture for Infoek202 from yesterday\"';
    }

    if (!subjectClassMatch) {
      return 'Ju lutem specifikoni l\u00ebnd\u00ebn dhe klas\u00ebn. Shembull: \"Fshi leksionin e CIS280 n\u00eb Infoek202 nga dje\"';
    }

    // Determine lecture date
    let lectureDate = new Date();
    const dateStr = dateMatch[0].toLowerCase();
    if (dateStr === 'today' || dateStr === 'sot') {
      lectureDate.setHours(0, 0, 0, 0);
    } else if (dateStr === 'tomorrow' || dateStr === 'nes\u00ebr') {
      lectureDate.setDate(lectureDate.getDate() + 1);
      lectureDate.setHours(0, 0, 0, 0);
    } else if (dateStr === 'yesterday' || dateStr === 'dje') {
      lectureDate.setDate(lectureDate.getDate() - 1);
      lectureDate.setHours(0, 0, 0, 0);
    } else {
      lectureDate = new Date(dateMatch[0]);
      lectureDate.setHours(0, 0, 0, 0);
    }

    const subjectName = subjectClassMatch[1].trim();
    const className = subjectClassMatch[2].trim();

    // Find subject
    const subject = await prisma.subject.findFirst({
      where: {
        OR: [
          { name: { contains: subjectName } },
          { code: { contains: subjectName } }
        ]
      }
    });

    if (!subject) {
      return `Lënda "${subjectName}" nuk u gjet.`;
    }

    // Find class
    const classObj = await prisma.class.findFirst({
      where: { name: { contains: className } }
    });

    if (!classObj) {
      return `Klasa "${className}" nuk u gjet.`;
    }

    // Find lecture
    const lecture = await prisma.lecture.findFirst({
      where: {
        date: {
          gte: lectureDate,
          lt: new Date(lectureDate.getTime() + 24 * 60 * 60 * 1000)
        },
        teachingAssignment: {
          subjectId: subject.id,
          classId: classObj.id,
          professorId: user.isAdmin ? undefined : user.professorId
        }
      },
      include: {
        teachingAssignment: {
          include: { subject: true, class: true }
        }
      }
    });

    if (!lecture) {
      return `Leksioni për "${subject.name}" në klasën "${classObj.name}" në datën ${lectureDate.toLocaleDateString()} nuk u gjet.`;
    }

    // Check permission
    if (!user.isAdmin && lecture.teachingAssignment.professorId !== user.professorId) {
      return 'Ju mund të fshini vetëm leksionet tuaja.';
    }

    await prisma.lecture.delete({
      where: { id: lecture.id }
    });

    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'DELETE',
      entity: 'lectures',
      entityId: lecture.id,
      details: {
        subject: lecture.teachingAssignment.subject.name,
        class: lecture.teachingAssignment.class.name,
        date: lecture.date
      }
    });

    return `✅ Leksioni u fshi me sukses!\n\nLënda: ${lecture.teachingAssignment.subject.name}\nKlasa: ${lecture.teachingAssignment.class.name}\nData: ${lectureDate.toLocaleDateString()}`;
  }

  // View teaching assignments
  if (lowerMessage.includes('teaching') || (lowerMessage.includes('my') && lowerMessage.includes('assignment'))) {
    const assignments = await prisma.teachingAssignment.findMany({
      where: user.isAdmin ? {} : { professorId: user.professorId },
      include: {
        professor: true,
        subject: true,
        class: true,
        type: true,
        _count: {
          select: { lectures: true }
        }
      }
    });

    if (assignments.length === 0) {
      return user.isAdmin ? 'No teaching assignments found in the system.' : 'You have no teaching assignments.';
    }

    const assignmentList = assignments
      .map((a: typeof assignments[0], idx: number) =>
        `${idx + 1}. ID: ${a.id} - ${a.subject.name} (${a.subject.code}) - ${a.class.name} - ${a.type.name} - ${a._count.lectures} lectures`
      )
      .join('\n');

    await logActivity({
      userId: user.professorId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE',
      entity: 'ai-query',
      details: { query: 'list_teaching_assignments', resultCount: assignments.length }
    });

    return `Found ${assignments.length} teaching assignment(s):\n\n${assignmentList}`;
  }

  // Default response
  // Log unknown query
  await logActivity({
    userId: user.professorId,
    userName: `${user.firstName} ${user.lastName}`,
    action: 'CREATE',
    entity: 'ai-query',
    details: { query: 'unknown', message }
  });

  return `I understand you want to: "${message}"\n\n` +
    `📋 **What I can help you with:**\n\n` +
    `📊 **View Data:**\n` +
    `• List students, professors, classes, subjects\n` +
    `• View lectures (today, tomorrow, this week)\n` +
    `• Show system statistics\n` +
    `• View teaching assignments\n\n` +
    `➕ **Create:**\n` +
    `• Create lecture for assignment X on DATE\n` +
    `• Mark attendance for student X in lecture Y as STATUS\n\n` +
    `🗑️ **Delete:**\n` +
    `• Delete lecture X\n\n` +
    `💡 **Examples:**\n` +
    `• "Show today's lectures"\n` +
    `• "Create lecture for teaching assignment 5 tomorrow"\n` +
    `• "Mark student 10 lecture 5 as present"\n` +
    `• "List my teaching assignments"\n` +
    `• "Delete lecture 15"`;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
    
    const user = {
      professorId: payload.professorId as number,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      isAdmin: payload.isAdmin as boolean,
    };

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const response = await processAIRequest(message, user);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Agent error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
