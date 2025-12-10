import { axiosClient } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import {
  ClassCreationRequest,
  ClassDetailResponse,
  ClassResponse,
  CourseFilterData,
  LecturerFilterData,
  RoomFilterData,
  AttendanceSessionResponse,
  AttendanceSessionRequest,
} from "../model/class_model";

export function getAllClasses(page: number, size: number) {
  const params = {
    page,
    size,
  };
  return axiosClient.get("/courseclasses", { params });
}

//Lấy ra tên khóa học để hiển thị lên combobox
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

export async function createClass(request: ClassCreationRequest) {
  console.log("Request Data for creating class:", request);
  try {
    const response = await axiosClient.post<ApiResponse<any>>("/courseclasses", request);
    console.log("Create class API response:", response.data);
    return response;
  } catch (error: any) {
    console.error("Create class API error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error;
  }
}

export async function changeClassStatus(classId: number) {
  try {
    const response = await axiosClient.post(`/courseclasses/${classId}`);
    if (response.data && response.data.code === 1000) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Thay đổi trạng thái thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Thay đổi trạng thái thất bại:", message);
    throw new Error(message);
  }
}

export const filterClasses = async (
  lecturerId: number | null,
  roomId: number | null,
  courseId: number | null,
  searchTerm: string | null,
  page: number,
  size: number
) => {
  try {
    const response = await axiosClient.get(`courseclasses/filter`, {
      params: {
        lecturerId: lecturerId || null,
        roomId: roomId || null,
        courseId: courseId || null,
        className: searchTerm || null,
        page: page,
        size: size,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lọc lớp học:", error);
    throw error;
  }
};

export const getClassDetail = async (id: number | string) => {
  try {
    const response = await axiosClient.get<ApiResponse<ClassDetailResponse>>(
      `/courseclasses/${id}`
    );
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || "Lấy chi tiết lớp học thất bại"
      );
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error(`Lỗi khi lấy chi tiết lớp học ${id}:`, message);
    throw new Error(message);
  }
};

export const updateClass = async (
  classId: number | string,
  request: ClassCreationRequest
) => {
  try {
    const response = await axiosClient.put(`courseclasses/${classId}`, request);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật lớp học ${classId}:`, error);
    throw error;
  }
};

export const getClassesEnrolled = async (page: number, size: number) => {
  try {
    const response = await axiosClient.get<ApiResponse<ClassResponse>>(
      "/students/get-classes-enrolled",
      {
        params: {
          page,
          size,
        },
      }
    );

    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || "Lấy danh sách lớp học thất bại"
      );
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Lấy danh sách lớp học API error:", message);
    throw new Error(message);
  }
};

export const getAttendanceBySessionId = async (sessionId: number) => {
  try {
    const response = await axiosClient.get<
      ApiResponse<AttendanceSessionResponse>
    >(`/courseclasses/sessions/${sessionId}/attendance`, {
      withCredentials: true,
    });
    if (response.data && response.data.code === 1000 && response.data.data) {
      console.log("Fetched attendance session data:", response.data.data);
      return response.data.data;
    } else {
      throw new Error(
        response.data?.message || "Lấy danh sách điểm danh thất bại"
      );
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Lấy danh sách điểm danh API error:", message);
    throw new Error(message);
  }
};

export const saveAttendance = async (
  sessionId: number | string,
  request: AttendanceSessionRequest
) => {
  try {
    console.log("Saving attendance with request data:", request);
    const response = await axiosClient.post<
      ApiResponse<AttendanceSessionResponse>
    >(`/lecturers/sessions/${sessionId}/attendance`, request, {
      withCredentials: true,
    });
    console.log("Save attendance response:", response.data);
    if (
      response.data &&
      response.data.code === 1000 &&
      response.data.data
    ) {
      console.log("Lưu điểm danh thành công:", response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lưu điểm danh thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Lưu điểm danh API error:", message);
    throw new Error(message);
  }
};

export const registerCourseForStudent = async (
  studentId: number,
  classIds: number[],
  paymentMethodId: number
) => {
  try {
    const response = await axiosClient.post(
      `/orders`,
      { 
        studentId,
        classIds,
        paymentMethodId
      }
    );
    if (response.data && response.data.code === 1000) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Đăng ký khóa học thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Đăng ký khóa học API error:", message);
    throw new Error(message);
  }
};

// Mock payment methods until API is available
export const getPaymentMethods = async () => {
  return [
    { id: 1, name: "Tiền mặt", description: "Thanh toán bằng tiền mặt tại trung tâm" },
    { id: 2, name: "VNPay", description: "Thanh toán qua cổng VNPay" }
  ];
};

// Xác nhận thanh toán tiền mặt
export const confirmCashPayment = async (invoiceId: number) => {
  try {
    const response = await axiosClient.post(
      `/orders/payment/confirm-cash`,
      null,
      { params: { invoiceId } }
    );
    if (response.data && response.data.code === 1000) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Xác nhận thanh toán thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Xác nhận thanh toán API error:", message);
    throw new Error(message);
  }
};
