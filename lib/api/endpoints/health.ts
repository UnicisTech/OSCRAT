import { ApiResponse } from '@/types';
import { api } from '@/lib/api/client';

export interface HealthResponse {
  status: string;
  version: string;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export const healthEndpoints = {
  check: () => api.get<ApiResponse<HealthResponse>>('/health'),
};
