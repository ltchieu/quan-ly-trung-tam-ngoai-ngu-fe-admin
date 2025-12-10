import { axiosClient } from "../api/axios_client";
import {
    DashboardStatsResponse,
    ActivityResponse,
    CourseProgressData,
    EndingClassData,
    DashboardData,
} from "../model/dashboard_model";

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

export const getCourseProgress = async (): Promise<CourseProgressData[]> => {
    const response = await axiosClient.get("/admin/dashboard/course-progress");
    return response.data.data as CourseProgressData[];
};

export const getEndingClasses = async (): Promise<EndingClassData[]> => {
    const response = await axiosClient.get("/admin/dashboard/ending-classes");
    return response.data.data as EndingClassData[];
};

// --- Service Functions ---

export const getDashboardData = async (): Promise<DashboardData> => {
    // Gọi các API song song để tối ưu performance
    const [stats, courseProgress, endingClasses] = await Promise.all([
        getDashboardStats().catch((err) => {
            console.error("Error fetching dashboard stats:", err);
            return {
                doanhThuThang: 0,
                dangKyHomNay: 0,
                lopDangDay: 0,
            };
        }),
        getCourseProgress().catch((err) => {
            console.error("Error fetching course progress:", err);
            return [];
        }),
        getEndingClasses().catch((err) => {
            console.error("Error fetching ending classes:", err);
            return [];
        }),
    ]);
    
    // Map dữ liệu từ API sang format để tương thích với UI
    const dashboardData: DashboardData = {
        kpi: {
            revenue: stats.doanhThuThang || 0,
            revenueGrowth: 12.5,
            newStudents: stats.dangKyHomNay || 0,
            activeClasses: stats.lopDangDay || 0,
            pendingInvoices: 8,
        },
        annualRevenue: [],
        topCourses: [],
        paymentMethods: [],
        courseProgress: courseProgress,
        canceledSessions: [],
        endingClasses: endingClasses,
        topLecturers: [],
        lecturerDistribution: [],
    };
    
    return dashboardData;
};
