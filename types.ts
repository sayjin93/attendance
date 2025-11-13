// ============================================================================
// CORE DOMAIN INTERFACES
// ============================================================================

export interface Professor {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  teachingAssignments?: TeachingAssignment[];
}

export interface Program {
  id: number;
  name: string;
  classes?: Class[];
  subject?: Subject[];
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  programId: number;
  program?: Program;
  teachingAssignments?: TeachingAssignment[];
}

export interface Class {
  id: number;
  name: string;
  programId: number;
  program?: Program;
  students?: Student[];
  teachingAssignments?: TeachingAssignment[];
}

export interface Student {
  id: number;
  firstName: string;
  father?: string | null;
  lastName: string;
  institutionEmail: string;
  personalEmail?: string | null;
  phone?: string | null;
  memo?: string | null;
  orderId?: number | null;
  classId: number;
  class?: Class;
  attendance?: Attendance[];
}

export interface Lecture {
  id: number;
  date: string | Date;
  teachingAssignmentId: number;
  teachingAssignment?: TeachingAssignment;
  attendance?: Attendance[];
}

export interface AttendanceStatus {
  id: number;
  name: string;
  attendance?: Attendance[];
}

export interface Attendance {
  id: number;
  studentId: number;
  student?: Student;
  lectureId: number;
  lecture?: Lecture;
  statusId: number;
  status?: AttendanceStatus;
}

export interface TeachingAssignment {
  id: number;
  professorId: number;
  professor?: Professor;
  subjectId: number;
  subject?: Subject;
  classId: number;
  class?: Class;
  typeId: number;
  type?: TeachingType;
  lectures?: Lecture[];
}

export interface TeachingType {
  id: number;
  name: string;
  assignments?: TeachingAssignment[];
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

// UI Component Props
export interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapse?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: string;
}

export interface AlertProps {
  type?: 'default' | 'warning' | 'error' | 'success' | 'info';
  title: string;
  message?: string;
  desc?: string;
  onClose?: () => void;
  className?: string;
}

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export interface SkeletonProps {
  times?: number;
  rootCls?: string;
  innerCls?: string;
}

// Form Component Props
export interface AddLectureFormProps {
  assignments: TeachingAssignmentWithDetails[];
  isAdmin: boolean;
  onClose: () => void;
}

export interface EditLectureFormProps {
  lecture: LectureForEdit;
  assignments: TeachingAssignmentWithDetails[];
  onClose: () => void;
}

export interface LectureForEdit {
  id: number;
  date: string | Date;
  professor: {
    id: number;
    firstName: string;
    lastName: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
  };
  class: {
    id: number;
    name: string;
  };
}

export interface AddLectureCardProps {
  assignments: TeachingAssignmentWithDetails[];
  isAdmin: boolean;
}

export interface AddAssignmentFormProps {
  isAdmin: string;
  professors: Professor[];
  subjects: Subject[];
  classes: Class[];
  programs: Program[];
  teachingTypes: TeachingType[];
}

export interface EditAssignmentFormProps {
  assignment: TeachingAssignment;
  professors: Professor[];
  subjects: Subject[];
  classes: Class[];
  teachingTypes: TeachingType[];
  onClose: () => void;
}

export interface AddClassFormProps {
  programs: Program[];
  isAdmin: string;
}

export interface EditClassFormProps {
  classItem: Class;
  programs: Program[];
  onClose: () => void;
}

export interface AddSubjectFormProps {
  programs: Program[];
  isAdmin: string;
}

export interface EditSubjectFormProps {
  subject: Subject;
  programs: Program[];
  onClose: () => void;
}

export interface EditProfessorFormProps {
  professor: Professor;
  onClose: () => void;
}

export interface EditStudentFormProps {
  student: Student;
  classes: Class[];
  onClose: () => void;
}

// Page Component Props
export interface DashboardClientProps {
  fullName: string;
  isAdmin: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE INTERFACES
// ============================================================================

// Lectures API
export interface CreateLectureRequest {
  assignmentId: number;
  date: string;
}

export interface UpdateLectureRequest {
  id: number;
  assignmentId?: number;
  date?: string;
}

export interface LecturesResponse {
  lectures: LectureWithDetails[];
  assignments: TeachingAssignmentWithDetails[];
  isAdmin: boolean;
  professorId?: number;
}

// Dashboard API
export interface DashboardStats {
  classes: number;
  students: number;
  professors: number;
  subjects: number;
  assignments: number;
  lectures: number;
  attendance?: number;
  assignmentClasses?: Array<{ id: number; name: string; types: TeachingType[] }>;
  subjectList?: Array<{ id: number; name: string; code: string; types: TeachingType[] }>;
}

// Reports API
export interface ReportData {
  students: StudentReport[];
  summary: {
    totalStudents: number;
    passedStudents: number;
    failedStudents: number;
    averageAttendance: number;
  };
  metadata?: {
    program: string;
    class: string;
    subject: string;
  };
}

export interface StudentReport {
  id: number | string;
  firstName: string;
  lastName: string;
  memo?: string | null;
  presence?: number;
  absence?: number;
  participation?: number;
  totalLectures: number;
  attendedLectures: number;
  participatedLectures: number;
  leaveLectures: number;
  attendancePercentage: number;
  passedLectures: boolean;
  totalSeminars: number;
  attendedSeminars: number;
  participatedSeminars: number;
  leaveSeminars: number;
  seminarPercentage: number;
  passedSeminars: boolean;
  overallPassed: boolean;
}

// Registry API
export interface RegistryData {
  programs: RegistryProgram[];
  classes: RegistryClass[];
  subjects: RegistrySubject[];
  types: RegistryTeachingType[];
  professors?: RegistryProfessor[];
  lectures: RegistryLecture[];
  students: RegistryStudent[];
  attendance: RegistryAttendanceRecord[];
  registryRows: StudentRegistryRow[];
}

export interface RegistryProgram {
  id: string;
  name: string;
}

export interface RegistryClass {
  id: string;
  name: string;
  programId: string;
  program?: {
    id: string;
    name: string;
  };
}

export interface RegistrySubject {
  id: string;
  name: string;
  code: string;
}

export interface RegistryTeachingType {
  id: string;
  name: string;
}

export interface RegistryProfessor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface RegistryLecture {
  id: string;
  date: string;
  typeId: string;
  typeName: string;
}

export interface RegistryStudent {
  id: string;
  firstName: string;
  lastName: string;
  memo?: string | null;
}

export interface RegistryAttendanceRecord {
  studentId: string;
  lectureId: string;
  status: { id: number; name: string };
}

export interface StudentRegistryRow {
  student: RegistryStudent;
  attendanceByLecture: { [lectureId: string]: { id: number; name: string } | null };
  absenceCount: number;
  totalLectures: number;
  absencePercentage: number;
  status: 'NK' | 'OK';
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

// Detailed interfaces for API responses with nested data
export interface LectureWithDetails {
  id: number;
  date: string | Date;
  teachingAssignmentId: number;
  teachingAssignment: {
    id: number;
    professor: {
      id: number;
      firstName: string;
      lastName: string;
    };
    subject: {
      id: number;
      name: string;
      code: string;
    };
    class: {
      id: number;
      name: string;
    };
    type: {
      id: number;
      name: string;
    };
  };
  attendance?: Attendance[];
}

export interface TeachingAssignmentWithDetails extends TeachingAssignment {
  professor: Professor;
  subject: Subject;
  class: Class & { program: Program };
  type: TeachingType;
}

export interface AttendanceRecord {
  id: number;
  firstName: string;
  lastName: string;
  memo?: string | null;
  status: AttendanceStatus;
}

export interface ClassWithLectures extends Class {
  lectures: Lecture[];
}

// ============================================================================
// LEGACY INTERFACES (for backward compatibility)
// TODO: Remove these once all components are updated
// ============================================================================
