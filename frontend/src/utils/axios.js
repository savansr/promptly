import axios from 'axios';

const API_URL = 'https://promptly-tuhj.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      // Check if backend is running
      if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.error('Backend server is not running. Please check the API URL:', API_URL);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 