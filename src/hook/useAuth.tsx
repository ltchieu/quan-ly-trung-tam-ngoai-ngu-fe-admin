import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

import { setupAxiosInterceptors } from "../api/setup_axios";
import { LoginResponse } from "../model/auth_model";
import { logoutService, refreshToken } from "../services/auth_service";
import { getTimeUntilExpiry, isTokenExpired } from "../util/token_util";

interface Auth {
  accessToken: string | null;
  role: string | null;
  userId: number | null;
}

interface AuthContextType {
  auth: Auth;
  isLoading: boolean;
  setAuth: (auth: Auth) => void;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<Auth>({
    accessToken: null,
    role: null,
    userId: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false); // Changed to false - PersistLogin handles loading

  const login = (data: LoginResponse) => {
    setAuth({
      accessToken: data.accessToken,
      role: data.role,
      userId: data.userId,
    });
    localStorage.setItem("role", data.role);
    localStorage.setItem("userId", data.userId.toString());
  };

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (e) {
      console.error("Lỗi khi gọi API logout (có thể do token đã hết hạn):", e);
    }
    setAuth({
      accessToken: null,
      role: null,
      userId: null,
    });
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string> => {
    try {
      const tokenResponse = await refreshToken();
      setAuth({
        accessToken: tokenResponse.accessToken,
        role: tokenResponse.role || localStorage.getItem("role"),
        userId: tokenResponse.userId || Number(localStorage.getItem("userId")),
      });
      // Store role and userId in localStorage
      if (tokenResponse.role) localStorage.setItem("role", tokenResponse.role);
      if (tokenResponse.userId) localStorage.setItem("userId", tokenResponse.userId.toString());

      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Lỗi khi refresh token:", error);
      await logout();
      throw error;
    }
  }, [logout]);

  useEffect(() => {
    const cleanup = setupAxiosInterceptors(
      () => {
        console.log("Getting access token from state:", auth.accessToken ? "exists" : "null");
        return auth.accessToken;
      },
      logout,
      refreshAccessToken
    );
    return cleanup;
  }, [auth.accessToken, logout, refreshAccessToken]);

  // Auto-refresh token trước khi hết hạn
  useEffect(() => {
    if (!auth.accessToken) {
      return;
    }

    // Kiểm tra xem token đã hết hạn chưa
    if (isTokenExpired(auth.accessToken)) {
      console.log("⚠️ Token already expired, attempting refresh...");
      refreshAccessToken().catch((error) => {
        console.error("❌ Failed to refresh expired token:", error);
      });
      return;
    }

    // Tính thời gian còn lại cho đến khi hết hạn
    const timeUntilExpiry = getTimeUntilExpiry(auth.accessToken);
    
    // Refresh token trước 5 phút (300000ms) trước khi hết hạn
    // Nếu token còn ít hơn 5 phút, refresh ngay lập tức
    const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes
    const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_BEFORE_EXPIRY);

    console.log(`⏰ Token will be refreshed in ${Math.round(refreshTime / 1000)}s (expires in ${Math.round(timeUntilExpiry / 1000)}s)`);

    const timerId = setTimeout(() => {
      console.log("🔄 Auto-refreshing token before expiry...");
      refreshAccessToken().catch((error) => {
        console.error("❌ Auto-refresh failed:", error);
      });
    }, refreshTime);

    return () => {
      clearTimeout(timerId);
    };
  }, [auth.accessToken, refreshAccessToken]);

  // REMOVED: Auto refresh on mount - PersistLogin handles this
  // Xóa useEffect tự động refresh để tránh race condition với PersistLogin

  return (
    <AuthContext.Provider
      value={{ auth, setAuth, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
