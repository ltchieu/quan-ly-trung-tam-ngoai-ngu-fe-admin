import { axiosClient } from "../api/axios_client";
import { StudentModel } from "../model/student_model";
import { ApiResponse } from "../model/api_respone";

export const getStudentInfo = async (): Promise<StudentModel> => {
  try {
    const response = await axiosClient.get<ApiResponse<StudentModel>>("/students");
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Failed to fetch student info");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get Student Info API error:", message);
    throw new Error(message);
  }
};

export const updateStudentInfo = async (data: Partial<StudentModel>): Promise<void> => {
  try {
    const response = await axiosClient.put<ApiResponse<void>>("/students", data);
    if (response.data && response.data.code === 1000) {
      return;
    } else {
      throw new Error(response.data?.message || "Failed to update student info");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Update Student Info API error:", message);
    throw new Error(message);
  }
};

export const createStudent = async (data: any): Promise<StudentModel> => {
  try {
    const response = await axiosClient.post<ApiResponse<StudentModel>>("/students", data);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Failed to create student");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Create Student API error:", message);
    throw new Error(message);
  }
};

const MOCK_STUDENTS: StudentModel[] = Array.from({ length: 50 }).map((_, index) => ({
  mahocvien: index + 1,
  manguoidung: 100 + index,
  hoten: `Học viên ${index + 1}`,
  gioitinh: index % 2 === 0, // Nam/Nữ xen kẽ
  ngaysinh: "2000-01-01",
  sdt: `090${1000000 + index}`,
  email: `student${index + 1}@example.com`,
  diachi: `Số ${index + 1} Đường ABC, Quận XYZ, TP.HCM`,
  hinhanh: "https://via.placeholder.com/150",
  trinhdo: ["Beginner", "Intermediate", "Advanced"][index % 3],
}));

export const getAllStudents = async (page: number, limit: number) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const start = page * limit;
  const end = start + limit;
  const data = MOCK_STUDENTS.slice(start, end);

  return {
    data: {
      data: {
        students: data,
        totalItems: MOCK_STUDENTS.length,
      },
    },
  };
};

export const getStudentById = async (id: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const student = MOCK_STUDENTS.find((s) => s.mahocvien === id);
  return {
    data: {
      data: student,
    },
  };
};

export const updateStudent = async (id: number, data: Partial<StudentModel>) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Updated student", id, data);
  return {
    data: {
      message: "Cập nhật thành công",
    },
  };
};
