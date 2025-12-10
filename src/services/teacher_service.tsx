import { axiosClient } from "../api/axios_client";
import { GiangVien, LoaiBangCap, BangCap, TeacherInfo, LecturerResponse, LecturerListResponse, LecturerDashboardStatsResponse, LecturerRequest, DegreeDTO } from "../model/teacher_model";
import { ApiResponse, Page } from "../model/api_respone";

export const getTeacherInfoById = async (id?: number | string): Promise<TeacherInfo> => {
  try {
    // Nếu có id → get by id, nếu không có id → get current user (me)
    let url = id ? `/lecturers/${id}` : "/lecturers/me";

    const response = await axiosClient.get<ApiResponse<TeacherInfo>>(url);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Failed to fetch teacher profile");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get Teacher Profile API error:", message);
    throw new Error(message);
  }
};

export const getLecturerDashboardStats = async (): Promise<LecturerDashboardStatsResponse> => {
  try {
    const response = await axiosClient.get<ApiResponse<LecturerDashboardStatsResponse>>("/lecturers/dashboard/stats");
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Failed to fetch dashboard stats");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get Lecturer Dashboard Stats API error:", message);
    throw new Error(message);
  }
};

export const createLecturer = async (request: LecturerRequest): Promise<LecturerResponse> => {
  try {
    const response = await axiosClient.post<ApiResponse<LecturerResponse>>("/lecturers", request);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Failed to create lecturer");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Create Lecturer API error:", message);
    throw new Error(message);
  }
};

export const getDegrees = async (): Promise<DegreeDTO[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<DegreeDTO[]>>("/degrees");
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Failed to fetch degrees");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get Degrees API error:", message);
    throw new Error(message);
  }
};

export const getAllLecturersPaginated = async (
  page: number = 0,
  size: number = 10,
  sortBy: string = "lecturerId",
  sortDirection: string = "asc"
): Promise<LecturerListResponse> => {
  const response = await axiosClient.get<ApiResponse<Page<LecturerResponse>>>("/lecturers", {
    params: { page, size, sortBy, sortDirection }
  });
  if (response.data && response.data.data) {
    const pageData = response.data.data;
    return {
      currentPage: pageData.number,
      totalPages: pageData.totalPages,
      totalItems: pageData.totalElements,
      lecturers: pageData.content
    };
  }
  throw new Error(response.data?.message || "Failed to fetch lecturers");
};

/**
 * Lấy thông tin chi tiết giảng viên theo ID
 * GET /lecturers/detail/{id}
 */
export const getLecturerDetail = async (id: number): Promise<ApiResponse<LecturerResponse>> => {
  try {
    const response = await axiosClient.get<ApiResponse<LecturerResponse>>(`/lecturers/detail/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get Lecturer Detail API error:", message);
    throw new Error(message);
  }
};

/**
 * Cập nhật thông tin giảng viên
 * PUT /lecturers/{id}
 */
export interface LecturerUpdateRequest {
  fullName?: string;
  dateOfBirth?: string;
  imagePath?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  certificates?: {
    degreeTypeId: number;  // Backend expects degreeTypeId not degreeId
    level?: string;
  }[];
}

export const updateLecturer = async (
  id: number,
  request: LecturerUpdateRequest
): Promise<ApiResponse<LecturerResponse>> => {
  try {
    const response = await axiosClient.put<ApiResponse<LecturerResponse>>(
      `/lecturers/${id}`,
      request
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Update Lecturer API error:", message);
    throw new Error(message);
  }
};

/**
 * Giảng viên tự cập nhật thông tin của mình
 * PUT /lecturers/me
 */
export const updateMyLecturerInfo = async (
  request: LecturerUpdateRequest
): Promise<ApiResponse<LecturerResponse>> => {
  try {
    const response = await axiosClient.put<ApiResponse<LecturerResponse>>(
      `/lecturers/me`,
      request
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Update My Lecturer Info API error:", message);
    throw new Error(message);
  }
};

/**
 * Xóa giảng viên
 * DELETE /lecturers/{id}
 */
export const deleteLecturer = async (id: number): Promise<void> => {
  try {
    const response = await axiosClient.delete<ApiResponse<void>>(`/lecturers/${id}`);
    if (response.data && response.data.code === 1000) {
      return;
    } else {
      throw new Error(response.data?.message || "Failed to delete lecturer");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Delete Lecturer API error:", message);
    throw new Error(message);
  }
};
