import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_URL_API;

const apiClient = axios.create({
  baseURL: API_URL,
});

const clearTokenCache = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

const getValidToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await axios.post(`${API_URL}/auth/refresh`, {
    refreshToken,
  });
  const newToken = response.data.token;
  localStorage.setItem("token", newToken);
  return newToken;
};

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error getting token:", error);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        clearTokenCache();
        const newToken = await getValidToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (retryError) {
        console.error("Error refreshing token:", retryError);
        clearTokenCache();
        try {
          window.dispatchEvent(new CustomEvent("auth:logout"));
        } catch (e) {
          window.dispatchEvent(new Event("auth:logout"));
        }
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
