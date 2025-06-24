import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL;

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `${baseURL}`,
    headers: {
    'Content-Type': 'application/json',
},
});


instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
    config.headers.Authorization = `Bearer ${token}`;
}
    return config;
}, (error) => {
    return Promise.reject(error);
});


instance.interceptors.response.use(
    (response) => response,
    (error) => {
    console.error('Axios error:', error?.response?.data?.message || error.message);
    return Promise.reject(error);
}
);

export default instance;
