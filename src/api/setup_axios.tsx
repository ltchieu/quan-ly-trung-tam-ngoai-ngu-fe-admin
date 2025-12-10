import { axiosClient } from "./axios_client";

type GetAccessTokenFn = () => string | null;
type LogoutFn = () => void;
type RefreshAccessTokenFn = () => Promise<string>;

export const setupAxiosInterceptors = (
  getAccessToken: GetAccessTokenFn,
  logout: LogoutFn,
  refreshAccessTokenFn: RefreshAccessTokenFn
) => {
  const reqInterceptorId = axiosClient.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      const url = config.url || "unknown";
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`✅ ${config.method?.toUpperCase()} ${url}: Token attached`);
      } else {
        console.log(`⚠️ ${config.method?.toUpperCase()} ${url}: NO TOKEN`);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  const resInterceptorId = axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const url = originalRequest?.url || "unknown";

      console.log(`❌ ${status} error on ${url}`);

      // Chỉ retry cho 401/403, KHÔNG phải refreshtoken endpoint, và chưa retry
      if (
        (status === 401 || status === 403) &&
        !originalRequest._retry &&
        !url.includes("/auth/refreshtoken") &&
        !url.includes("/auth/login")
      ) {
        originalRequest._retry = true;
        console.log(`🔄 Attempting token refresh for ${url}...`);

        try {
          const newAccessToken = await refreshAccessTokenFn();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log(`✅ Retrying ${url} with new token`);
          return axiosClient(originalRequest);
        } catch (err) {
          console.log(`❌ Token refresh failed, logging out`);
          logout();
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );

  return () => {
    axiosClient.interceptors.request.eject(reqInterceptorId);
    axiosClient.interceptors.response.eject(resInterceptorId);
  };
};
