import { useQuery, useMutation } from '@tanstack/react-query';
import { usersEndpoints } from '@/lib/api/endpoints/users';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';
import type {
  UpdateUserData,
  UpdatePasswordData,
} from '@/lib/api/endpoints/users';

export function useGetCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => usersEndpoints.getCurrentUser(),
  });
}

export function useUpdateUser() {
  const { data: session, update } = useSession();

  return useMutation({
    mutationFn: (data: UpdateUserData) => usersEndpoints.updateUser(data),
    onSuccess: async (response, variables) => {
      if (response.data && session) {
        // Update session with new user data if it contains name related fields
        if ('firstName' in variables || 'lastName' in variables) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: response.data.name,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
            },
          });
        }

        // If email was updated and we received the data
        if ('email' in variables && variables.email) {
          await update({
            ...session,
            user: {
              ...session.user,
              email: variables.email,
            },
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordData) =>
      usersEndpoints.updatePassword(data),
  });
}

export function useUpdateAvatar() {
  const { data: session, update } = useSession();

  return useMutation({
    mutationFn: (imageData: string) => usersEndpoints.updateAvatar(imageData),
    onSuccess: async (response, imageData) => {
      if (response.data && session) {
        await update({
          ...session,
          user: {
            ...session.user,
            image: imageData,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useDeleteAvatar() {
  const { data: session, update } = useSession();

  return useMutation({
    mutationFn: () => usersEndpoints.deleteAvatar(),
    onSuccess: async (response) => {
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            image: null,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (password: string) => usersEndpoints.deleteUser(password),
  });
}
