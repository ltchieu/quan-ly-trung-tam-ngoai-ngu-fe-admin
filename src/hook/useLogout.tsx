import { useAuth } from "./useAuth";
import { logoutService } from "../services/auth_service";

export const useLogout = () => {
  const { setAuth } = useAuth();

  const logout = async () => {
    console.log(" Đăng xuất...");
    
    try {
      // Gọi API backend để xóa refresh token cookie
      await logoutService();
      console.log(" Đã xóa refresh token trên server");
    } catch (error) {
      console.warn(" Logout API failed (expected if token expired)");
    }
    
    // Clear auth state
    setAuth({
      accessToken: null,
      role: null,
      userId: null,
    });
    
    // Xóa persist flag
    localStorage.removeItem("persist");
    
    console.log(" Đăng xuất hoàn tất");
  };

  return logout;
};
