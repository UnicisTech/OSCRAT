import { ApiResponse } from '@/types';
import { api } from '@/lib/api/client';

export type PasswordValidationData = {
  password: string;
};

export interface PasswordValidationResult {
  strength: number;
  feedback: {
    warning?: string;
    suggestions: string[];
  };
  valid: boolean;
}

export const passwordEndpoints = {
  validate: (data: PasswordValidationData) =>
    api.post<ApiResponse<PasswordValidationResult>>('/password', data),
};
