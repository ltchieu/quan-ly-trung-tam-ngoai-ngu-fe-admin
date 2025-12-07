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
