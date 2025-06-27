import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL;

const instance = axios.create({
    baseURL: baseURL,
    headers: {
    'Content-Type': 'application/json',
},
});

//  Attach access token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
(error) => Promise.reject(error)
);

// 👉 Handle token expiration
instance.interceptors.response.use(
(response) => response,
async (error) => {
    const originalRequest = error.config;

    if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry &&
        error.response.data?.message?.includes('expired')
    ) {
        originalRequest._retry = true;

        try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error("No refresh token found");

        const res = await axios.post(`${baseURL}/api/token/refresh`, {
            refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        // Update localStorage and retry the original request
        localStorage.setItem('authToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
    } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/'; 
        return Promise.reject(refreshError);
    }
    }

    return Promise.reject(error);
}
);

export default instance;
