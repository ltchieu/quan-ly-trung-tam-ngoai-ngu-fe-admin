import { useEffect, useRef } from "react";
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
  
  // Dùng ref để tránh multiple concurrent refresh requests
  const isRefreshingRef = useRef(false);
  const refreshPromiseRef = useRef<Promise<string> | null>(null);

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
        const url = prevRequest?.url || "unknown";
        
        // Nếu lỗi 401/403 và chưa retry, không phải endpoint auth
        if (
          (error?.response?.status === 401 || error?.response?.status === 403) && 
          !prevRequest?.sent &&
          !url.includes("/auth/refreshtoken") &&
          !url.includes("/auth/login")
        ) {
          prevRequest.sent = true; // Đánh dấu đã retry
          
          try {
            console.log("🔄 401/403 detected, attempting token refresh...");
            
            // Nếu đang refresh, đợi request refresh hiện tại
            if (isRefreshingRef.current && refreshPromiseRef.current) {
              console.log("⏳ Waiting for existing refresh to complete...");
              const newAccessToken = await refreshPromiseRef.current;
              prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
              return axiosClient(prevRequest);
            }
            
            // Bắt đầu refresh mới
            isRefreshingRef.current = true;
            refreshPromiseRef.current = refresh();
            
            const newAccessToken = await refreshPromiseRef.current;
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            
            console.log("✅ Token refreshed, retrying request");
            return axiosClient(prevRequest);
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
            return Promise.reject(refreshError);
          } finally {
            isRefreshingRef.current = false;
            refreshPromiseRef.current = null;
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
