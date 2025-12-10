import { useEffect } from "react";
import { axiosClient } from "../api/axios_client";
import { useAuth } from "./useAuth";
import { useRefreshToken } from "./useRefreshToken";

/**
 * Hook để sử dụng axios với auto token attachment và auto refresh
 * Thay thế cho setup_axios pattern cũ
 */
export const useAxiosPrivate = () => {
  const { auth } = useAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    // Request interceptor: Gắn access token vào mọi request
    // CRITICAL: Đọc auth.accessToken trực tiếp từ closure - không cần dependency
    const requestIntercept = axiosClient.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Tự động refresh token khi gặp 401
    const responseIntercept = axiosClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        
        // Nếu lỗi 401/403 và chưa retry
        if ((error?.response?.status === 401 || error?.response?.status === 403) && !prevRequest?.sent) {
          prevRequest.sent = true; // Đánh dấu đã retry
          
          try {
            console.log("🔄 401/403 detected, attempting token refresh...");
            const newAccessToken = await refresh();
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosClient(prevRequest);
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup: Eject interceptors khi component unmount
    return () => {
      axiosClient.interceptors.request.eject(requestIntercept);
      axiosClient.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return axiosClient;
};
