import {
  useUpdateUser,
  useUpdatePassword,
  useUpdateAvatar,
  useDeleteUser,
} from '@/lib/api/hooks/users';
import type {
  UpdateUserData,
  UpdatePasswordData,
} from '@/lib/api/endpoints/users';

/**
 * Comprehensive hook to manage all account-related functionality
 */
export function useAccount() {
  const updateUserMutation = useUpdateUser();
  const updatePasswordMutation = useUpdatePassword();
  const updateAvatarMutation = useUpdateAvatar();
  const deleteUserMutation = useDeleteUser();

  /**
   * Update user profile information
   * @param data User data to update
   */
  const updateUser = async (data: UpdateUserData) => {
    try {
      const result = await updateUserMutation.mutateAsync(data);
      return { success: true, data: result };
    } catch (error: unknown) {
      return { success: false, error };
    }
  };

  /**
   * Update user password
   * @param data Password data containing current and new password
   */
  const updatePassword = async (data: UpdatePasswordData) => {
    try {
      const result = await updatePasswordMutation.mutateAsync(data);
      return { success: true, data: result };
    } catch (error: unknown) {
      return { success: false, error };
    }
  };

  /**
   * Upload and update the user avatar
   * @param imageData Base64 encoded image data
   */
  const updateAvatar = async (imageData: string) => {
    try {
      const result = await updateAvatarMutation.mutateAsync(imageData);
      return { success: true, data: result };
    } catch (error: unknown) {
      return { success: false, error };
    }
  };

  /**
   * Delete user account
   * @param password Current password for verification
   */
  const deleteAccount = async (password: string) => {
    try {
      const result = await deleteUserMutation.mutateAsync(password);
      return { success: true, data: result };
    } catch (error: unknown) {
      return { success: false, error };
    }
  };

  return {
    updateUser,
    updatePassword,
    updateAvatar,
    deleteAccount,
    isUpdateUserLoading: updateUserMutation.isPending,
    isUpdatePasswordLoading: updatePasswordMutation.isPending,
    isUpdateAvatarLoading: updateAvatarMutation.isPending,
    isDeleteAccountLoading: deleteUserMutation.isPending,
  };
}
