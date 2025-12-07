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
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  const resInterceptorId = axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/auth/refreshtoken")
      ) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshAccessTokenFn();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosClient(originalRequest);
        } catch (err) {
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
