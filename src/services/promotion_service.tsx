import { axiosClient } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import { PromotionResponse, PromotionRequest } from "../model/promotion_model";

export const getAllPromotions = async (): Promise<PromotionResponse[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<PromotionResponse[]>>("/promotions");
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy danh sách khuyến mãi thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get all promotions API error:", message);
    throw new Error(message);
  }
};

export const getActivePromotions = async (): Promise<PromotionResponse[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<PromotionResponse[]>>("/promotions/active");
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy danh sách khuyến mãi đang hoạt động thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get active promotions API error:", message);
    throw new Error(message);
  }
};

export const getPromotionById = async (id: number): Promise<PromotionResponse> => {
  try {
    const response = await axiosClient.get<ApiResponse<PromotionResponse>>(`/promotions/${id}`);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Lấy chi tiết khuyến mãi thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Get promotion by ID API error:", message);
    throw new Error(message);
  }
};

export const createPromotion = async (request: PromotionRequest): Promise<PromotionResponse> => {
  try {
    const response = await axiosClient.post<ApiResponse<PromotionResponse>>("/promotions", request);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Tạo khuyến mãi thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Create promotion API error:", message);
    throw new Error(message);
  }
};

export const updatePromotion = async (id: number, request: PromotionRequest): Promise<PromotionResponse> => {
  try {
    const response = await axiosClient.put<ApiResponse<PromotionResponse>>(`/promotions/${id}`, request);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Cập nhật khuyến mãi thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Update promotion API error:", message);
    throw new Error(message);
  }
};

export const togglePromotionStatus = async (id: number): Promise<PromotionResponse> => {
  try {
    const response = await axiosClient.put<ApiResponse<PromotionResponse>>(`/promotions/${id}/toggle`);
    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Thay đổi trạng thái khuyến mãi thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Toggle promotion status API error:", message);
    throw new Error(message);
  }
};

// Alias for backward compatibility
export const deletePromotion = togglePromotionStatus;

// Legacy function for backward compatibility
export const getAllPromotionTypes = async (): Promise<any[]> => {
  // This is now derived from promotions data
  // Return empty for now, types come from backend in promotion response
  return [];
};
