import { axiosClient } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import { CourseCategoryResponse } from "../model/course_category_model";

export async function getAllCategories(): Promise<ApiResponse<CourseCategoryResponse[]>> {
  const response = await axiosClient.get<ApiResponse<CourseCategoryResponse[]>>("/categories");
  return response.data;
}

export async function createCategory(data: { name: string }): Promise<ApiResponse<CourseCategoryResponse>> {
  const response = await axiosClient.post<ApiResponse<CourseCategoryResponse>>("/categories", data);
  return response.data;
}

export async function updateCategory(id: number, data: { name: string }): Promise<ApiResponse<CourseCategoryResponse>> {
  const response = await axiosClient.put<ApiResponse<CourseCategoryResponse>>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<ApiResponse<any>> {
  const response = await axiosClient.delete<ApiResponse<any>>(`/categories/${id}`);
  return response.data;
}