import { useEffect } from "react";
import { axiosPrivate } from "@/lib/axiosPrivate";
import { useAuth } from "./useAuth";
import { api } from "@/lib/axios";

export function useAxiosPrivate() {
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error.response.status === 401 && !prevRequest.sent) {
          prevRequest.sent = true;
          const response = await api.patch(
            `${import.meta.env.VITE_BACKEND_BASE_URL}/token/refresh`,
            {},
            {
              withCredentials: true,
            }
          );
          setAccessToken(response.data.token);
          prevRequest.headers["Authorization"] =
            `Bearer ${response.data.token}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, setAccessToken]);

  return axiosPrivate;
}
