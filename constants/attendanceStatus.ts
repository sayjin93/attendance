// Attendance Status Constants - matches database AttendanceStatus table
export const ATTENDANCE_STATUS = {
  PRESENT: { id: 1, name: 'PRESENT' },
  ABSENT: { id: 2, name: 'ABSENT' },
  PARTICIPATED: { id: 3, name: 'PARTICIPATED' },
  LEAVE: { id: 4, name: 'LEAVE' }
} as const;

// Type for better TypeScript support
export type AttendanceStatusConstant = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

// Helper functions
export const getStatusById = (id: number): AttendanceStatusConstant | undefined => {
  return Object.values(ATTENDANCE_STATUS).find(status => status.id === id);
};

export const getStatusByName = (name: string): AttendanceStatusConstant | undefined => {
  return Object.values(ATTENDANCE_STATUS).find(status => status.name === name);
};

// Default status
export const DEFAULT_STATUS = ATTENDANCE_STATUS.PRESENT;