import axios from 'axios';

// Java Middleware Client (Localhost:8081)
export const javaClient = axios.create({
  baseURL: 'http://127.0.0.1:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// NestJS Backend Client (Localhost:8000)
export const nestClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for Java Client
javaClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Java Middleware Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// Response Interceptor for Nest Client
nestClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Backend API Error:', error.response?.data || error.message || error);
    return Promise.reject(error);
  },
);
