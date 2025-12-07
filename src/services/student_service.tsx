import { axiosClient } from "../api/axios_client";
import { StudentModel, StudentAdminResponse, StudentListResponse, CreateStudentAdminRequest, CreateStudentAdminResponse } from "../model/student_model";
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

// Admin APIs (from documentation)
export const getAllStudents = async (
  page: number,
  size: number,
  search?: string
): Promise<ApiResponse<StudentListResponse>> => {
  try {
    const response = await axiosClient.get<ApiResponse<StudentListResponse>>("/admin/students", {
      params: {
        page,
        size,
        search: search || undefined,
      },
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get All Students API error:", message);
    throw new Error(message);
  }
};

export const getStudentById = async (id: number): Promise<ApiResponse<StudentAdminResponse>> => {
  try {
    const response = await axiosClient.get<ApiResponse<StudentAdminResponse>>(`/admin/students/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get Student By ID API error:", message);
    throw new Error(message);
  }
};

export const updateStudent = async (
  id: number,
  data: Partial<StudentAdminResponse>
): Promise<ApiResponse<StudentAdminResponse>> => {
  try {
    const response = await axiosClient.put<ApiResponse<StudentAdminResponse>>(
      `/admin/students/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Update Student API error:", message);
    throw new Error(message);
  }
};

export const createAdminStudent = async (
  data: CreateStudentAdminRequest
): Promise<ApiResponse<CreateStudentAdminResponse>> => {
  try {
    const response = await axiosClient.post<ApiResponse<CreateStudentAdminResponse>>(
      `/admin/students`,
      data
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Create Admin Student API error:", message);
    throw new Error(message);
  }
};
