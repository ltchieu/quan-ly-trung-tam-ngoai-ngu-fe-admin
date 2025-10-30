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
}