export interface DashboardStatsResponse {
  tongHocVien: number;
  tongGiangVien: number;
  tongLop: number;
  lopDangDay: number;
  doanhThuThang: number;
  tongKhoaHoc: number;
  soPhongTrong: number;
  dangKyHomNay: number;

  // activeStudents: number;
  // totalTeachers: number;
  // ongoingClasses: number;
  // monthlyRevenue: number;
  // totalCourses: number;
  // todayRegistrations: number;
}

// Activity Response từ API
export interface ActivityResponse {
  id: string;
  type: 'registration' | 'payment' | 'class_end' | 'profile_update' | 'other';
  title: string;
  description: string;
  timestamp: string; // ISO 8601 format
  userId?: string | null;
  userName?: string | null;
}

// Canceled Session Data - Thay thế Class Schedule
export interface CanceledSessionData {
  sessionId: number;          // ID buổi học
  classId: number;            // ID lớp học
  className: string;          // Tên lớp
  courseName: string;         // Tên khóa học
  sessionDate: string;        // Ngày buổi học bị hủy (YYYY-MM-DD)
  cancelReason?: string;      // Lý do hủy
  hasMakeupSession: boolean;  // Đã có buổi học bù chưa
  makeupSessionDate?: string; // Ngày buổi học bù (nếu có)
}
