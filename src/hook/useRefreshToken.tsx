import { useAuth } from "./useAuth";
import { refreshToken } from "../services/auth_service";
import { jwtDecode } from "jwt-decode";

/**
 * Hook để refresh access token
 * Sử dụng refresh token (từ httpOnly cookie) để lấy access token mới
 */
export const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    try {
      console.log("🔄 Refreshing access token...");
      const response = await refreshToken();
      
      // Decode token để lấy thông tin user nếu API không trả về
      const decoded: any = jwtDecode(response.accessToken);
      console.log(" Decoded token:", decoded);

      const role = response.role || decoded.role || decoded.roles || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const userId = response.userId || decoded.userId || decoded.id || decoded.sub;

      setAuth({
        accessToken: response.accessToken,
        role: role,
        userId: userId,
      });

      console.log("✅ Token refreshed successfully");
      return response.accessToken;
    } catch (error: any) {
      console.error("❌ Failed to refresh token:", error.message);
      throw error;
    }
  };

  return refresh;
};
