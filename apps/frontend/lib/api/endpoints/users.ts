import { api } from '@/lib/api/client';
import { User } from '@oscrat/model';
import type { UserReturned } from '@/types';

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

export const usersEndpoints = {
  getCurrentUser: () => api.get<User>('/users'),

  updateUser: (data: UpdateUserData) => api.put<UserReturned>('/users', data),

  updatePassword: (data: UpdatePasswordData) =>
    api.put<void>('/password', data),

  updateAvatar: (image: string) => api.put<UserReturned>('/users', { image }),

  deleteAvatar: () => api.put<UserReturned>('/users', { image: null }),

  deleteUser: (password: string) =>
    api.delete<void>('/users', {
      params: { password },
    }),
};
