import { axiosClient, axiosRaw } from "../api/axios_client";
import { ApiResponse } from "../model/api_respone";
import { LoginRequest, LoginResponse, TokenRefreshResponse } from "../model/auth_model";

export async function loginService(
  loginData: LoginRequest
): Promise<LoginResponse> {
  try {
    const res = await axiosClient.post<ApiResponse<LoginResponse>>(
      "auth/login",
      loginData
    );

    if (res.data && res.data.code === 1000 && res.data.data) {
      return res.data.data;
    } else {
      throw new Error(
        res.data?.message || "Đăng nhập thất bại vì gửi không đúng định dạng"
      );
    }
  } catch (err: any) {
     if (err.response) {
      console.log("Server returned:", err.response.status, err.response.data);
    }
    console.error("Login API error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.message || "An error occurred during login."
    );
  }
}

export async function logoutService(): Promise<boolean> {
  try {
    const response = await axiosClient.post<ApiResponse<any>>(
      '/auth/logout'
    );

    if (response.data && response.data.code === 1000) {
      return true;
    } else {
      console.error("Lỗi khi đăng xuất (backend):", response.data.message);
      return false;
    }
  } catch (error: any) {
    console.error("Lỗi khi đăng xuất (network/auth):", error);
    return false;
  }
}

export async function refreshToken(): Promise<TokenRefreshResponse> {
  try {
    const response = await axiosRaw.post<ApiResponse<TokenRefreshResponse>>(
      "/auth/refreshtoken"
    );

    if (response.data && response.data.code === 1000 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || "Refresh token thất bại");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Refresh token API error:", message);
    throw new Error(message);
  }
}
