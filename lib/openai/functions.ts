import { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * OpenAI Function definitions for the Attendance Management System
 * These functions can be called by GPT to perform operations
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
      description: 'Get detailed information about a specific student including their attendance records',
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
      description: 'Get attendance statistics for a student, class, or subject over a date range',
      parameters: {
        type: 'object',
        properties: {
          studentId: {
            type: 'number',
            description: 'Filter by student ID',
          },
          className: {
            type: 'string',
            description: 'Filter by class name',
          },
          subjectName: {
            type: 'string',
            description: 'Filter by subject name',
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
  // CREATE OPERATIONS
  // ============================================
  {
    type: 'function',
    function: {
      name: 'create_lecture',
      description: 'Create a new lecture for a subject in a class on a specific date',
      parameters: {
        type: 'object',
        properties: {
          subjectName: {
            type: 'string',
            description: 'Name or code of the subject',
          },
          className: {
            type: 'string',
            description: 'Name of the class',
          },
          date: {
            type: 'string',
            description: 'Date of the lecture (YYYY-MM-DD format)',
          },
        },
        required: ['subjectName', 'className', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mark_attendance',
      description: 'Mark attendance for a student in a lecture',
      parameters: {
        type: 'object',
        properties: {
          studentEmail: {
            type: 'string',
            description: 'Email of the student',
          },
          lectureId: {
            type: 'number',
            description: 'ID of the lecture',
          },
          status: {
            type: 'string',
            enum: ['present', 'absent', 'late', 'excused'],
            description: 'Attendance status',
          },
          subjectName: {
            type: 'string',
            description: 'Name of subject (used if lectureId not provided)',
          },
          className: {
            type: 'string',
            description: 'Name of class (used if lectureId not provided)',
          },
          date: {
            type: 'string',
            description: 'Date of lecture (YYYY-MM-DD, used if lectureId not provided)',
          },
        },
        required: ['studentEmail', 'status'],
      },
    },
  },

  // ============================================
  // UPDATE OPERATIONS
  // ============================================
  {
    type: 'function',
    function: {
      name: 'update_attendance',
      description: 'Update attendance status for a student in a lecture',
      parameters: {
        type: 'object',
        properties: {
          attendanceId: {
            type: 'number',
            description: 'ID of the attendance record',
          },
          status: {
            type: 'string',
            enum: ['present', 'absent', 'late', 'excused'],
            description: 'New attendance status',
          },
        },
        required: ['attendanceId', 'status'],
      },
    },
  },

  // ============================================
  // DELETE OPERATIONS
  // ============================================
  {
    type: 'function',
    function: {
      name: 'delete_lecture',
      description: 'Delete a lecture by ID',
      parameters: {
        type: 'object',
        properties: {
          lectureId: {
            type: 'number',
            description: 'ID of the lecture to delete',
          },
        },
        required: ['lectureId'],
      },
    },
  },
];
