import { api } from '@/lib/api/client';
import { User } from '@oscrat/model';
import type { UserReturned } from '@/types';

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  image?: string;
};

export type UpdatePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeEmailData = {
  email: string;
  currentPassword: string;
};

// Dev (CONFIRM_EMAIL=false) applies immediately and returns `email`; prod defers
// and returns `pendingEmail` (a confirmation link was sent to the new address).
export type ChangeEmailResponse = {
  email?: string;
  pendingEmail?: string;
};

export const usersEndpoints = {
  getCurrentUser: () => api.get<User>('/users'),

  updateUser: (data: UpdateUserData) => api.put<UserReturned>('/users', data),

  changeEmail: (data: ChangeEmailData) =>
    api.put<ChangeEmailResponse>('/email', data),

  updatePassword: (data: UpdatePasswordData) =>
    api.put<void>('/password', data),

  updateAvatar: (image: string) => api.put<UserReturned>('/users', { image }),

  deleteAvatar: () => api.put<UserReturned>('/users', { image: null }),

  deleteUser: (password: string) =>
    api.delete<void>('/users', {
      params: { password },
    }),
};
