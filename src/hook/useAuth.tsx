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

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  userId: number | null;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (data: LoginResponse) => {
    setAccessToken(data.accessToken);
    setRole(data.role);
    setUserId(data.userId);
    localStorage.setItem("role", data.role);
    localStorage.setItem("userId", data.userId.toString());
  };

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (e) {
      console.error("Lỗi khi gọi API logout (có thể do token đã hết hạn):", e);
    }
    setAccessToken(null);
    setUserId(null);
    setRole(null);
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string> => {
    try {
      const tokenResponse = await refreshToken();
      setAccessToken(tokenResponse.accessToken);
      // Restore role and userId from localStorage if available
      const storedRole = localStorage.getItem("role");
      const storedUserId = localStorage.getItem("userId");
      if (storedRole) setRole(storedRole);
      if (storedUserId) setUserId(Number(storedUserId));

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
        return accessToken;
      },
      logout,
      refreshAccessToken
    );
    return cleanup;
  }, [accessToken, logout, refreshAccessToken]);

  useEffect(() => {
    // Khi tải trang, chỉ thử refresh token
    const tryLoadSession = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.log("Không thể tự động đăng nhập (không có session hợp lệ).");
      } finally {
        setIsLoading(false);
      }
    };

    tryLoadSession();
  }, [refreshAccessToken]);

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ accessToken, role, userId, isLoading, login, logout }}
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
