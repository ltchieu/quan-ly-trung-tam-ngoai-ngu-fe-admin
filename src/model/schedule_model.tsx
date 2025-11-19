export interface ScheduleCheckRequest {
  courseId: number;
  startDate: string;
  startTime: string;
  durationMinutes: number;
  schedulePattern: string; // Ví dụ: "2-4-6"
  preferredRoomId?: number | null;
  preferredLecturerId?: number | null;
}

// Thông tin phòng/giảng viên khả dụng
export interface ResourceOption {
  id: number;
  name: string;
}

// Thông tin check ban đầu
export interface InitialCheckResult {
  hasAvailableRooms: boolean;
  hasAvailableLecturers: boolean;
  availableRoomCount: number;
  availableLecturerCount: number;
  roomConflicts?: { type: string; description: string }[];
  lecturerConflicts?: { type: string; description: string }[];
}

// Một phương án thay thế (Alternative)
export interface ScheduleAlternative {
  type: "ALTERNATIVE_TIME" | "ALTERNATIVE_ROOM" | "ALTERNATIVE_START_DATE";
  reason: string;
  priority: number;
  startDate: string;
  startTime: string;
  endTime: string;
  schedulePattern: string;
  availableRooms: ResourceOption[];
  availableLecturers: ResourceOption[];
}

// Response tổng từ API
export interface ScheduleSuggestionResponse {
  status: "AVAILABLE" | "CONFLICT";
  message: string;
  initialCheck: InitialCheckResult;
  availableRooms: ResourceOption[];
  availableLecturers: ResourceOption[];
  alternatives: ScheduleAlternative[];
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