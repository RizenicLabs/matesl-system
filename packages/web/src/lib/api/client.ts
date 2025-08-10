import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const original = error.config as any;

        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
                { refreshToken }
              );

              const { tokens } = response.data.data;
              localStorage.setItem('access_token', tokens.accessToken);
              localStorage.setItem('refresh_token', tokens.refreshToken);

              // Retry original request
              original.headers.Authorization = `Bearer ${tokens.accessToken}`;
              return this.instance(original);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (error.response?.status === 429) {
          toast.error('Too many requests. Please wait a moment.');
        } else if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please try again.');
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: any): Promise<T> {
    return this.instance.get(url, config).then(response => response.data);
  }

  public post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.instance.post(url, data, config).then(response => response.data);
  }

  public put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.instance.put(url, data, config).then(response => response.data);
  }

  public delete<T = any>(url: string, config?: any): Promise<T> {
    return this.instance.delete(url, config).then(response => response.data);
  }

  public upload<T = any>(url: string, formData: FormData, config?: any): Promise<T> {
    return this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    }).then(response => response.data);
  }
}

export const apiClient = new ApiClient();