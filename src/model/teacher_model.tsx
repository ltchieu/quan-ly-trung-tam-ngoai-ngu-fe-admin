export interface LoaiBangCap {
  maLoai: number;
  ten: string;
}

export interface BangCap {
  ma: number;
  maGiangVien: number;
  maLoai: number;
  trinhDo: string;
  loaiBangCap?: LoaiBangCap
}

export interface GiangVien {
  magv: number;
  hoten: string;
  ngaysinh: string;
  gioitinh: boolean;
  sdt: string;
  email: string;
  diachi: string;
  anhdaidien: string;
  bangCaps: BangCap[];
  mota?: string;
}

export interface TeacherFilter {
  keyword?: string;
}

export interface QualificationDTO {
  degreeId: number;
  degreeName: string;
  level: string;
}

export interface AccountInfo {
  userId: number;
  username: string; // email hoặc sdt
  password?: string; // chỉ trả về nếu là admin
  role: string;
  createdAt: string;
  isVerified: boolean;
}

export interface TeacherInfo {
  lecturerId: number;
  fullName: string;
  dateOfBirth: string;
  imagePath: string;
  phoneNumber: string;
  email: string;
  
  // Thống kê
  totalClasses?: number;
  totalStudents?: number;
  rating?: number;
  totalReviews?: number;
  
  // Thông tin tài khoản (chỉ Admin mới xem được)
  accountInfo?: AccountInfo;
  
  qualifications: QualificationDTO[];
}

export interface CertificateInfo {
  certificateId: number;       // ID bằng cấp cụ thể (bảng bangcap) - để tracking
  degreeTypeId: number;        // ID loại bằng cấp (bảng loaibangcap)
  degreeTypeName: string;      // Tên loại: IELTS, TOEIC, TOEFL...
  level: string;               // Trình độ: Band 8.0, 950 điểm...
}

export interface LecturerResponse {
  lecturerId: number;
  fullName: string;
  dateOfBirth: string;
  imagePath: string;
  userId: number;
  username: string;
  email: string;
  phoneNumber: string;
  totalClasses: number;
  activeClasses: number;
  certificates: CertificateInfo[];
}

export interface LecturerListResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  lecturers: LecturerResponse[];
}

// Dashboard Models
export interface LecturerDashboardOverview {
  classesInCharge: number;    // Tổng số lớp phụ trách
  todayClasses: number;       // Số lớp dạy hôm nay
  totalStudents: number;      // Tổng số học viên
  hoursTaught: number;        // Số giờ đã dạy trong tháng
}

export interface WeeklyScheduleItem {
  id: number;              // Session ID
  className: string;
  room: string;
  time: string;             // Format: "HH:mm - HH:mm"
  date: string;             // LocalDate
  status: string;           // Upcoming, Completed, Canceled
}

export interface ActiveClass {
  id: number;              // Class ID
  className: string;
  course: string;
  students: number;
  progress: string;         // Format: "5/24"
  progressPercent: number;     // 0-100
}

export interface Reminder {
  id: number;
  message: string;
  type: string;             // warning, info
}

export interface AttendanceStats {
  className: string;
  attendancePercent: number;   // 0-100
  absentPercent: number;       // 0-100
}

export interface LecturerDashboardStatsResponse {
  overview: LecturerDashboardOverview;
  weeklySchedule: WeeklyScheduleItem[];
  activeClasses: ActiveClass[];
  reminders: Reminder[];
  attendanceStats: AttendanceStats[];
}

// Degree Models
export interface DegreeDTO {
  id: number;
  name: string;
}

// Lecturer Request
export interface CertificateRequest {
  degreeTypeId: number;  // ID của loại bằng cấp (bảng loaibangcap: IELTS, TOEIC...)
  level?: string;        // Trình độ cụ thể (VD: "Band 8.0", "950 điểm", "Giỏi")
}

export interface LecturerRequest {
  fullName: string;
  dateOfBirth: string;      // Format: "YYYY-MM-DD"
  imagePath?: string;
  email: string;
  phoneNumber: string;
  password: string;
  certificates?: CertificateRequest[];
}
