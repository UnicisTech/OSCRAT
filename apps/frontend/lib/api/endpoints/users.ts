import { api } from '@/lib/api/client';
import { User } from '@oscrat/model';
import { ApiResponse } from '@/types';

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
};

export type UpdatePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export type UserReturned = {
  name: string;
  firstName: string;
  lastName: string;
};

export const usersEndpoints = {
  getCurrentUser: () => api.get<User>('/users'),

  updateUser: (data: UpdateUserData) =>
    api.put<ApiResponse<UserReturned>>('/users', data),

  updatePassword: (data: UpdatePasswordData) =>
    api.put<ApiResponse<void>>('/password', data),

  updateAvatar: (image: string) =>
    api.put<ApiResponse<UserReturned>>('/users', { image }),

  deleteUser: (password: string) =>
    api.delete<void>('/users', {
      params: { password },
    }),
};
