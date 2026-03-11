import { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * OpenAI Function definitions for the Attendance Management System
 * These functions can be called by GPT-5.4 to perform operations
 */

export const attendanceFunctions: ChatCompletionTool[] = [
  // ============================================
  // QUERY/READ OPERATIONS
  // ============================================
  {
    type: 'function',
    function: {
      name: 'get_system_statistics',
      description: 'Get overall system statistics including counts of students, professors, classes, subjects, and today\'s lectures',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_students',
      description: 'Get list of students. Can filter by class name or search by name/email.',
      parameters: {
        type: 'object',
        properties: {
          className: {
            type: 'string',
            description: 'Filter students by class name (e.g., "Infoek202")',
          },
          searchQuery: {
            type: 'string',
            description: 'Search students by name or email',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of students to return (default: 50)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_student_details',
      description: 'Get detailed information about a specific student including their recent attendance records. Can search by ID, email, or name.',
      parameters: {
        type: 'object',
        properties: {
          studentId: {
            type: 'number',
            description: 'The ID of the student',
          },
          email: {
            type: 'string',
            description: 'The email of the student',
          },
          studentName: {
            type: 'string',
            description: 'Search student by name (first name, last name, or full name)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_classes',
      description: 'Get list of all classes in the system',
      parameters: {
        type: 'object',
        properties: {
          programName: {
            type: 'string',
            description: 'Filter classes by program name',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_class_details',
      description: 'Get detailed information about a class including students and subjects',
      parameters: {
        type: 'object',
        properties: {
          className: {
            type: 'string',
            description: 'The name of the class (e.g., "Infoek202")',
          },
          classId: {
            type: 'number',
            description: 'The ID of the class',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_subjects',
      description: 'Get list of subjects',
      parameters: {
        type: 'object',
        properties: {
          searchQuery: {
            type: 'string',
            description: 'Search subjects by name or code',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_professors',
      description: 'Get list of professors',
      parameters: {
        type: 'object',
        properties: {
          searchQuery: {
            type: 'string',
            description: 'Search professors by name or email',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_lectures',
      description: 'Get lectures filtered by date, class, subject, or professor',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Filter by date (YYYY-MM-DD format)',
          },
          className: {
            type: 'string',
            description: 'Filter by class name',
          },
          subjectName: {
            type: 'string',
            description: 'Filter by subject name or code',
          },
          professorId: {
            type: 'number',
            description: 'Filter by professor ID',
          },
          typeName: {
            type: 'string',
            description: 'Filter by teaching type (e.g., "Leksion", "Seminar")',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_lecture_attendance',
      description: 'Get attendance records for a specific lecture',
      parameters: {
        type: 'object',
        properties: {
          lectureId: {
            type: 'number',
            description: 'The ID of the lecture',
          },
        },
        required: ['lectureId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_attendance_statistics',
      description: 'Get attendance statistics (counts and percentages) for a student, class, or subject. IMPORTANT: When querying for a specific student, you MUST provide subjectName AND typeName. If called for a student without both, the function returns the available subjects and types for that student so you can ask the user to choose. Subject name matching is fuzzy — partial or abbreviated names work (e.g., "Projektim db" matches "Projektim dhe analizë e bazave të të dhënave"). Use get_student_attendance_records for individual dated records.',
      parameters: {
        type: 'object',
        properties: {
          studentId: {
            type: 'number',
            description: 'Filter by student ID',
          },
          studentName: {
            type: 'string',
            description: 'Search student by name (alternative to studentId)',
          },
          className: {
            type: 'string',
            description: 'Filter by class name',
          },
          subjectName: {
            type: 'string',
            description: 'Filter by subject name (fuzzy matching supported — partial/abbreviated names work)',
          },
          typeName: {
            type: 'string',
            description: 'Filter by teaching type (e.g., "Leksion", "Seminar")',
          },
          startDate: {
            type: 'string',
            description: 'Start date (YYYY-MM-DD)',
          },
          endDate: {
            type: 'string',
            description: 'End date (YYYY-MM-DD)',
          },
        },
        required: [],
      },
    },
  },
  // ============================================
  // ADVANCED QUERY OPERATIONS
  // ============================================
  {
    type: 'function',
    function: {
      name: 'get_student_attendance_records',
      description: 'Get individual attendance records with dates for a student. IMPORTANT: When querying for a specific student, you MUST provide subjectName AND typeName. If called for a student without both, the function returns the available subjects and types for that student so you can ask the user to choose. Subject name matching is fuzzy — partial/abbreviated names work. Use this when asked about specific absence dates, detailed attendance history, or when user needs to see each lecture record.',
      parameters: {
        type: 'object',
        properties: {
          studentName: {
            type: 'string',
            description: 'Search student by name (first name, last name, or full name)',
          },
          studentId: {
            type: 'number',
            description: 'Student ID',
          },
          className: {
            type: 'string',
            description: 'Filter by class name',
          },
          subjectName: {
            type: 'string',
            description: 'Filter by subject name or code (fuzzy matching supported — partial/abbreviated names work)',
          },
          typeName: {
            type: 'string',
            description: 'Filter by teaching type (e.g., "Leksion", "Seminar")',
          },
          statusFilter: {
            type: 'string',
            enum: ['PRESENT', 'ABSENT', 'PARTICIPATED', 'LEAVE'],
            description: 'Filter by specific attendance status (e.g., "ABSENT" to get only absences)',
          },
          startDate: {
            type: 'string',
            description: 'Start date (YYYY-MM-DD)',
          },
          endDate: {
            type: 'string',
            description: 'End date (YYYY-MM-DD)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of records to return (default: 100)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_class_report',
      description: "Get NK/OK attendance report for a class and subject. Shows each student with attendance count, percentage, and pass/fail (NK/OK) status. NK (Nuk Kalon) = student fails due to too many absences. Thresholds: Leksion ≥50%, Seminar ≥75% attendance required to pass.",
      parameters: {
        type: 'object',
        properties: {
          className: {
            type: 'string',
            description: 'Name of the class (e.g., "MSH1INFA", "Infoek202")',
          },
          subjectName: {
            type: 'string',
            description: 'Name or code of the subject',
          },
          typeName: {
            type: 'string',
            description: 'Filter by teaching type: "Leksion" or "Seminar". If not specified, returns combined report for all types.',
          },
        },
        required: ['className', 'subjectName'],
      },
    },
  },
];
