export interface LoginRequest {
    identifier: string;
    password: string
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  userId: number;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  userId: number;
}

// Forgot Password & Reset Password Models
export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeResponse {
  email: string;
}

export interface ResetPasswordRequest {
  code: string;
  newPassword: string;
  confirmPassword: string;
}