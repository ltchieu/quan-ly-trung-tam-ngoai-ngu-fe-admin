export interface ScheduleCheckRequest {
  courseId: number;
  startDate: string;
  startTime: string;
  durationMinutes: number;
  schedulePattern: string; // Ví dụ: "2-4-6"
  excludeClassId?: number | null;
  preferredRoomId?: number | null;
  preferredLecturerId?: number | null;
}

// Thông tin xung đột chi tiết
export interface ConflictInfo {
  type: string; // "ROOM_CONFLICT" hoặc "TEACHER_CONFLICT"
  description: string;
  conflictDate?: string;
  conflictStartTime?: string;
  conflictEndTime?: string;
  conflictingClassName?: string;
  conflictingCourseName?: string;
}

// Thông tin check ban đầu (AvailabilityResult)
export interface AvailabilityResult {
  hasAvailableRooms: boolean;
  hasAvailableLecturers: boolean;
  availableRoomCount: number;
  availableLecturerCount: number;
  roomConflicts?: ConflictInfo[];
  lecturerConflicts?: ConflictInfo[];
}

// Thông tin phòng/giảng viên khả dụng (ResourceInfo)
export interface ResourceInfo {
  id: number;
  name: string;
  additionalInfo?: string;
}

// Legacy alias for backward compatibility
export type ResourceOption = ResourceInfo;

// Một phương án thay thế (Alternative)
export interface ScheduleAlternative {
  type: string; // "ALTERNATIVE_TIME", "ALTERNATIVE_ROOM", "ALTERNATIVE_START_DATE"
  reason: string;
  priority: number;
  startDate: string;
  startTime: string;
  endTime: string;
  schedulePattern: string;
  availableRooms: ResourceInfo[];
  availableLecturers: ResourceInfo[];
}

// Response tổng từ API
export interface ScheduleSuggestionResponse {
  status: "AVAILABLE" | "CONFLICT";
  message: string;
  initialCheck: AvailabilityResult;
  // Nếu available
  availableRooms?: ResourceInfo[];
  availableLecturers?: ResourceInfo[];
  // Nếu conflict
  alternatives?: ScheduleAlternative[];
}

export interface Session {
  sessionId: number;
  className: string;
  courseName: string;
  roomName: string;
  instructorName: string;
  status: boolean;
  note: string;
  schedulePattern: string;
  sessionDate: string;
  startTime: string; // HH:mm format
  durationMinutes: number;
}

export interface Period {
  period: string; // "Sáng", "Chiều", "Tối"
  sessions: Session[];
}

export interface DaySchedule {
  date: string;
  dayName: string;
  periods: Period[];
}

export interface WeeklyScheduleResponse {
  weekStart: string;
  weekEnd: string;
  days: DaySchedule[];
}