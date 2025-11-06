import { axiosClient } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import { ClassView, ClassCreationRequest, CourseFilterData, LecturerFilterData, RoomFilterData, CheckConflictRequest } from "../model/class_model";

export function getAllClasses(page: number, size: number) {
    const params = {
        page,
        size
    };
    return axiosClient.get("/courseclasses", { params });
}

export async function getCourseFilterList(): Promise<CourseFilterData[]> {
  try {
    const response = await axiosClient.get<ApiResponse<CourseFilterData[]>>(
      "/courses/activecourses-name"
    );

    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy khóa học thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Lấy khóa học API error:", message);
    throw new Error(message);
  }
}


export async function getLecturerFilterList(): Promise<LecturerFilterData[]> {
   try {
    const response = await axiosClient.get<ApiResponse<LecturerFilterData[]>>(
      "/lecturers/lecturer-name"
    );

    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy phòng học thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Lấy phòng học API error:", message);
    throw new Error(message);
  }
}


export async function getRoomFilterList(): Promise<RoomFilterData[]> {
try {
    const response = await axiosClient.get<ApiResponse<RoomFilterData[]>>(
      "/rooms/room-name"
    );

    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy phòng học thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Lấy phòng học API error:", message);
    throw new Error(message);
  }
}

export function createClass(request: ClassCreationRequest) {
    return axiosClient.post<ApiResponse<any>>("/courseclasses", request);
}

export async function getAvailableLecturers(
  request: CheckConflictRequest
): Promise<LecturerFilterData[]> {
  try {
    const response = await axiosClient.post<LecturerFilterData[]>(
      "/lecturers/available",
      request
    );
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy DS Giảng viên khả dụng:", error);
    throw new Error(error.response?.data?.message || "Lỗi API Giảng viên");
  }
}

export async function getAvailableRooms(
  request: CheckConflictRequest
): Promise<RoomFilterData[]> {
  try {
    const response = await axiosClient.post<ApiResponse<RoomFilterData[]>>(
      "/rooms/available",
      request
    );
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy phòng học thất bại");
    }
  } catch (error: any) {
    console.error("Lỗi khi lấy DS Phòng khả dụng:", error);
    throw new Error(error.response?.data?.message || "Lỗi API Phòng học");
  }
}