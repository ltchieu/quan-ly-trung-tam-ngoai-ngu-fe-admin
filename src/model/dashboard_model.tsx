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
  timestamp: string;
  userId?: string | null;
  userName?: string | null;
}

export interface CanceledSessionData {
  sessionId: number;          
  classId: number;            
  className: string;          
  courseName: string;        
  sessionDate: string;        
  cancelReason?: string;      
  hasMakeupSession: boolean;  
  makeupSessionDate?: string;
}

// KPI Data
export interface KpiData {
  revenue: number;
  revenueGrowth: number;
  newStudents: number;
  activeClasses: number;
  pendingInvoices: number;
}

// Revenue Chart Data
export interface RevenueChartData {
  month: number;
  revenue: number;
}

// Top Course Data
export interface TopCourseData {
  courseId: number;
  courseName: string;
  registrations: number;
  revenue: number;
}

// Payment Method Data
export interface PaymentMethodData {
  method: string;
  count: number;
}

// Course Progress Data
export interface CourseProgressData {
  classId: number;
  className: string;
  courseName: string;
  completedSessions: number;
  totalSessions: number;
  progressRate: number;
}

// Ending Class Data
export interface EndingClassData {
  classId: number;
  className: string;
  courseName: string;
  remainingSessions: number;
  endDate: string;
}

// Lecturer Productivity Data
export interface LecturerProductivityData {
  lecturerId: number;
  lecturerName: string;
  activeClasses: number;
}

// Lecturer Distribution Data
export interface LecturerDistributionData {
  status: string;
  count: number;
}

// Dashboard Aggregated Data
export interface DashboardData {
  kpi: KpiData;
  annualRevenue: RevenueChartData[];
  topCourses: TopCourseData[];
  paymentMethods: PaymentMethodData[];
  courseProgress: CourseProgressData[];
  canceledSessions: CanceledSessionData[];
  endingClasses: EndingClassData[];
  topLecturers: LecturerProductivityData[];
  lecturerDistribution: LecturerDistributionData[];
}
