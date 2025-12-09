export interface ClassView {
  classId: number;
  className: string;
  roomName: string;
  schedulePattern: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  status: string;
  maxCapacity: number;
  currentEnrollment: number;
  tuitionFee?: number;
  hasPendingMakeup?: boolean;
  canceledSessionsCount?: number;
}

export interface CourseFilterData {
  courseId: number;
  courseName: string;
}

export interface LecturerFilterData {
  lecturerId: number;
  lecturerName: string;
}

export interface RoomFilterData {
  roomId: number;
  roomName: string;
}

export interface ClassCreationRequest {
  courseId: number | string;
  className: string;
  lecturerId: number | string;
  roomId: number | string;
  schedule: string;
  startTime: string;
  minutesPerSession: number | string;
  startDate: string;
  note?: string;
}

export interface SessionInfoDetail {
  sessionId: number;
  date: string;
  note: string;
  status: string;
}

export interface StudentInClass {
  studentId: number;
  fullName: string;
  avatar: string;
  gender: boolean;
  email: string;
  phone: string;
}

export interface ClassDetailResponse {
  classId: number;
  className: string;
  courseName: string;
  schedulePattern: string;
  courseId: number;
  startTime: string;
  endTime: string;
  minutePerSession: number;
  startDate: string;
  endDate: string;
  roomName: string;
  instructorName: string;
  totalSessions: number;
  currentEnrollment: number;
  maxCapacity: number;
  students: StudentInClass[];
  sessions: SessionInfoDetail[];
}

export interface ClassInfo {
  classId: number;
  className: string;
  courseName: string;
  roomName: string;
  instructorName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  schedulePattern: string;
  status: string;
  maxCapacity: number;
  currentEnrollment: number;
  tuitionFee?: number;
  hasPendingMakeup?: boolean;
  canceledSessionsCount?: number;
}

export interface ClassResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  classes: ClassInfo[];
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface AttendanceEntryResponse {
  studentId: number;
  studentName: string;
  status: AttendanceStatus;
  note: string;
}

export interface AttendanceStatsResponse {
  sessionId: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

export interface AttendanceSessionResponse {
  sessionId: number;
  entries: AttendanceEntryResponse[];
}

export interface AttendanceEntryRequest {
  studentId: number;
  status: AttendanceStatus;
  note: string;
}

export interface AttendanceSessionRequest {
  sessionId: number;
  entries: AttendanceEntryRequest[];
}