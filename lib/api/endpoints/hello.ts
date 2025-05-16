import { ApiResponse } from '@/types';
import { api } from '@/lib/api/client';

interface HelloResponse {
  message: string;
}

export const helloEndpoints = {
  sayHello: () => api.get<ApiResponse<HelloResponse>>('/hello'),
};
