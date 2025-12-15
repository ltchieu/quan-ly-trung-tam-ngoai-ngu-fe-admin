import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number; // Expiration time (seconds since epoch)
  iat?: number; // Issued at time
  [key: string]: any;
}

/**
 * Decode JWT token và trả về payload
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    return null;
  }
};

/**
 * Kiểm tra xem token có hết hạn chưa
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Date.now() / 1000; // Convert to seconds
  return decoded.exp < currentTime;
};

/**
 * Tính thời gian còn lại (milliseconds) trước khi token hết hạn
 */
export const getTimeUntilExpiry = (token: string): number => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }
  
  const currentTime = Date.now() / 1000; // Current time in seconds
  const timeRemaining = (decoded.exp - currentTime) * 1000; // Convert to milliseconds
  
  return Math.max(0, timeRemaining);
};

/**
 * Kiểm tra xem token có sắp hết hạn không
 * @param token - JWT token
 * @param thresholdMinutes - Ngưỡng thời gian (phút) để coi là "sắp hết hạn"
 */
export const isTokenExpiringSoon = (token: string, thresholdMinutes: number = 5): boolean => {
  const timeRemaining = getTimeUntilExpiry(token);
  const thresholdMs = thresholdMinutes * 60 * 1000;
  
  return timeRemaining > 0 && timeRemaining < thresholdMs;
};

/**
 * Lấy thời điểm token hết hạn (Date object)
 */
export const getTokenExpiryDate = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
};
