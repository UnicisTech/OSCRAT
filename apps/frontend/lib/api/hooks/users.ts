import { useQuery, useMutation } from '@tanstack/react-query';
import { usersEndpoints } from '@/lib/api/endpoints/users';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import { useSession } from 'next-auth/react';
import type {
  UpdateUserData,
  UpdatePasswordData,
  ChangeEmailData,
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
      if (session) {
        // Update session with new user data if it contains name related fields
        if ('firstName' in variables || 'lastName' in variables) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: response.name,
              firstName: response.firstName,
              lastName: response.lastName,
            },
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useChangeEmail() {
  const { data: session, update } = useSession();

  return useMutation({
    mutationFn: (data: ChangeEmailData) => usersEndpoints.changeEmail(data),
    onSuccess: async (response) => {
      // Dev path (CONFIRM_EMAIL=false) applies immediately — refresh the session
      // with the new email. The deferred path returns `pendingEmail` and leaves
      // the session untouched until the user confirms via the emailed link.
      if (session && response.email) {
        await update({
          ...session,
          user: {
            ...session.user,
            email: response.email,
          },
        });
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
  const { update } = useSession();

  return useMutation({
    mutationFn: (imageData: string) => usersEndpoints.updateAvatar(imageData),
    onSuccess: async () => {
      await update();
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useDeleteAvatar() {
  const { update } = useSession();

  return useMutation({
    mutationFn: () => usersEndpoints.deleteAvatar(),
    onSuccess: async () => {
      await update();
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (password: string) => usersEndpoints.deleteUser(password),
  });
}
