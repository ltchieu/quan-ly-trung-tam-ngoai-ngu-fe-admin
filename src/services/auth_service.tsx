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
      console.log("🔐 Login response from backend:", {
        accessToken: res.data.data.accessToken?.substring(0, 20) + "...",
        role: res.data.data.role,
        userId: res.data.data.userId,
      });
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
      'auth/logout'
    );

    if (response.data && response.data.code === 1000) {
      console.log("✅ Logout successful on backend");
      return true;
    } else {
      console.warn("⚠️ Backend logout returned non-1000 code:", response.data?.message);
      return false;
    }
  } catch (error: any) {
    // KHÔNG coi đây là lỗi nghiêm trọng - có thể token đã hết hạn
    console.warn("⚠️ Backend logout failed (expected if token expired):", error.response?.status);
    return false; // Vẫn cho phép logout ở frontend
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

// Forgot Password & Reset Password Services
export async function forgotPasswordService(
  email: string
): Promise<ApiResponse<void>> {
  try {
    const response = await axiosClient.post<ApiResponse<void>>(
      "/auth/forgot-password",
      { email }
    );

    if (response.data && response.data.code === 1000) {
      return response.data;
    } else {
      throw new Error(
        response.data?.message || "Không thể gửi email reset password"
      );
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Forgot password API error:", message);
    throw new Error(message);
  }
}

export async function verifyResetCodeService(
  code: string
): Promise<ApiResponse<{ email: string }>> {
  try {
    const response = await axiosClient.get<ApiResponse<{ email: string }>>(
      `/auth/verify-reset-code`,
      { params: { code } }
    );

    if (response.data && response.data.code === 1000) {
      return response.data;
    } else {
      throw new Error(
        response.data?.message || "Mã xác minh không hợp lệ"
      );
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Verify reset code API error:", message);
    throw new Error(message);
  }
}

export async function resetPasswordService(
  code: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse<void>> {
  try {
    const response = await axiosClient.post<ApiResponse<void>>(
      "/auth/reset-password",
      { code, newPassword, confirmPassword }
    );

    if (response.data && response.data.code === 1000) {
      return response.data;
    } else {
      throw new Error(
        response.data?.message || "Không thể đặt lại mật khẩu"
      );
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error("Reset password API error:", message);
    throw new Error(message);
  }
}
