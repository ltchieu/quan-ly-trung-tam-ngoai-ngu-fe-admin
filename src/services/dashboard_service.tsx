import { axiosClient } from "../api/axios_client";
import { DashboardStatsResponse, ActivityResponse } from "../model/dashboard_model";

// --- Interfaces ---

export interface KpiData {
    revenue: number;
    revenueGrowth: number;
    newStudents: number;
    activeClasses: number;
    pendingInvoices: number;
}

export interface RevenueChartData {
    month: number;
    revenue: number;
}

export interface TopCourseData {
    courseId: number;
    courseName: string;
    registrations: number;
    revenue: number;
}

export interface PaymentMethodData {
    method: string; // 'VNPay', 'Cash', 'Transfer'
    count: number;
}

export interface CourseProgressData {
    classId: number;
    className: string;
    courseName: string;
    completedSessions: number;
    totalSessions: number;
    progressRate: number;
}

export interface ClassScheduleData {
    timeFrame: string;
    count: number;
}

export interface EndingClassData {
    classId: number;
    className: string;
    courseName: string;
    remainingSessions: number;
    endDate: string;
}

export interface LecturerProductivityData {
    lecturerId: number;
    lecturerName: string;
    activeClasses: number;
}

export interface LecturerDistributionData {
    status: string; // 'Teaching', 'Free'
    count: number;
}

export interface DashboardData {
    kpi: KpiData;
    annualRevenue: RevenueChartData[];
    topCourses: TopCourseData[];
    paymentMethods: PaymentMethodData[];
    courseProgress: CourseProgressData[];
    classSchedule: ClassScheduleData[];
    endingClasses: EndingClassData[];
    topLecturers: LecturerProductivityData[];
    lecturerDistribution: LecturerDistributionData[];
}

// --- Mock Data ---

const MOCK_DASHBOARD_DATA: DashboardData = {
    kpi: {
        revenue: 150000000, // 150M VND
        revenueGrowth: 12.5,
        newStudents: 45,
        activeClasses: 12,
        pendingInvoices: 8,
    },
    annualRevenue: [
        { month: 1, revenue: 120000000 },
        { month: 2, revenue: 110000000 },
        { month: 3, revenue: 140000000 },
        { month: 4, revenue: 130000000 },
        { month: 5, revenue: 160000000 },
        { month: 6, revenue: 180000000 },
        { month: 7, revenue: 170000000 },
        { month: 8, revenue: 190000000 },
        { month: 9, revenue: 210000000 },
        { month: 10, revenue: 200000000 },
        { month: 11, revenue: 220000000 },
        { month: 12, revenue: 240000000 },
    ],
    topCourses: [
        { courseId: 1, courseName: "IELTS Foundation", registrations: 120, revenue: 600000000 },
        { courseId: 2, courseName: "TOEIC 650+", registrations: 95, revenue: 380000000 },
        { courseId: 3, courseName: "Giao tiếp cơ bản", registrations: 80, revenue: 240000000 },
        { courseId: 4, courseName: "IELTS Advanced", registrations: 60, revenue: 420000000 },
        { courseId: 5, courseName: "Tiếng Anh trẻ em", registrations: 50, revenue: 150000000 },
    ],
    paymentMethods: [
        { method: "Chuyển khoản (VNPay)", count: 150 },
        { method: "Tiền mặt", count: 50 },
        { method: "Thẻ tín dụng", count: 20 },
    ],
    courseProgress: [
        { classId: 101, className: "IELTS F - K12", courseName: "IELTS Foundation", completedSessions: 18, totalSessions: 20, progressRate: 90 },
        { classId: 102, className: "TOEIC - K08", courseName: "TOEIC 650+", completedSessions: 25, totalSessions: 30, progressRate: 83.3 },
        { classId: 103, className: "Giao tiếp - K05", courseName: "Giao tiếp cơ bản", completedSessions: 5, totalSessions: 15, progressRate: 33.3 },
        { classId: 104, className: "IELTS A - K03", courseName: "IELTS Advanced", completedSessions: 12, totalSessions: 15, progressRate: 80 },
        { classId: 105, className: "Kids - K01", courseName: "Tiếng Anh trẻ em", completedSessions: 10, totalSessions: 10, progressRate: 100 },
    ],
    classSchedule: [
        { timeFrame: "Sáng (7h-12h)", count: 5 },
        { timeFrame: "Chiều (13h-17h)", count: 8 },
        { timeFrame: "Tối (17h-21h)", count: 15 },
    ],
    endingClasses: [
        { classId: 103, className: "Giao tiếp - K05", courseName: "Giao tiếp cơ bản", remainingSessions: 2, endDate: "2025-12-15" },
        { classId: 104, className: "IELTS A - K03", courseName: "IELTS Advanced", remainingSessions: 3, endDate: "2025-12-20" },
        { classId: 105, className: "Kids - K01", courseName: "Tiếng Anh trẻ em", remainingSessions: 0, endDate: "2025-12-10" },
        { classId: 107, className: "TOEIC B - K09", courseName: "TOEIC 750+", remainingSessions: 4, endDate: "2025-12-25" },
        { classId: 108, className: "Business - K02", courseName: "Business English", remainingSessions: 5, endDate: "2025-12-28" },
    ],
    topLecturers: [
        { lecturerId: 1, lecturerName: "Nguyễn Văn A", activeClasses: 5 },
        { lecturerId: 2, lecturerName: "Trần Thị B", activeClasses: 4 },
        { lecturerId: 3, lecturerName: "Le Van C", activeClasses: 3 },
        { lecturerId: 4, lecturerName: "Pham Thi D", activeClasses: 3 },
        { lecturerId: 5, lecturerName: "Hoang Van E", activeClasses: 2 },
    ],
    lecturerDistribution: [
        { status: "Đang giảng dạy", count: 15 },
        { status: "Đang rảnh", count: 5 },
    ],
};

// --- API Service Functions ---

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
    const response = await axiosClient.get<{ code: number; message: string; data: DashboardStatsResponse }>("/admin/dashboard/stats");
    return response.data.data;
};

export const getRecentActivities = async (limit: number = 10): Promise<ActivityResponse[]> => {
    const response = await axiosClient.get("/admin/dashboard/activities", {
        params: { limit }
    });
    return response.data.data as ActivityResponse[];
};

// --- Service Functions ---

export const getDashboardData = async (): Promise<DashboardData> => {
    try {
        // Gọi API thật để lấy stats
        const stats = await getDashboardStats();
        
        // Map dữ liệu từ API sang format cũ để tương thích với UI hiện tại
        const dashboardData: DashboardData = {
            kpi: {
                revenue: stats.doanhThuThang || 0,
                revenueGrowth: 12.5,
                newStudents: stats.dangKyHomNay || 0,
                activeClasses: stats.lopDangDay || 0,
                pendingInvoices: 8,
            },
            // Các phần khác vẫn dùng mock data tạm thời vì chưa có API
            annualRevenue: MOCK_DASHBOARD_DATA.annualRevenue,
            topCourses: MOCK_DASHBOARD_DATA.topCourses,
            paymentMethods: MOCK_DASHBOARD_DATA.paymentMethods,
            courseProgress: MOCK_DASHBOARD_DATA.courseProgress,
            classSchedule: MOCK_DASHBOARD_DATA.classSchedule,
            endingClasses: MOCK_DASHBOARD_DATA.endingClasses,
            topLecturers: MOCK_DASHBOARD_DATA.topLecturers,
            lecturerDistribution: MOCK_DASHBOARD_DATA.lecturerDistribution,
        };
        
        return dashboardData;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fallback to mock data if API fails
        return MOCK_DASHBOARD_DATA;
    }
};
