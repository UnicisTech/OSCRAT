import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.client.get<ApiResponse<T>>(url, config);

      // For blob responses, return raw data directly
      if (config?.responseType === 'blob') {
        return data as T;
      }

      if (data.error) {
        throw data.error;
      }
      return data.data; // Correct - returning T from ApiResponse<T>
    } catch (error) {
      throw this.transformError(error);
    }
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const { data: responseData } = await this.client.post<ApiResponse<T>>(
        url,
        data,
        config
      );
      if (responseData.error) {
        throw responseData.error;
      }
      return responseData.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const { data: responseData } = await this.client.put<ApiResponse<T>>(
        url,
        data,
        config
      );
      if (responseData.error) {
        throw responseData.error;
      }
      return responseData.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.client.delete<ApiResponse<T>>(url, config);
      if (data.error) {
        throw data.error;
      }
      return data.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const { data: responseData } = await this.client.patch<ApiResponse<T>>(
        url,
        data,
        config
      );
      if (responseData.error) {
        throw responseData.error;
      }
      return responseData.data;
    } catch (error) {
      throw this.transformError(error);
    }
  }

  private transformError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message:
          error.response?.data?.message || error.message || 'An error occurred',
        code: error.response?.status?.toString(),
        values: {},
      };
    }
    return {
      message: 'Unknown error occurred',
      values: {},
    };
  }
}

export const api = new ApiClient();
