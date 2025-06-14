import axios from "axios";
import { EnvVars } from "@/env";

const axiosInstance = axios.create({
  baseURL: EnvVars.API,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new Event("sessionExpired"));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
