import { useCreateResetPassword } from '@/lib/api/hooks/auth';
import type { ResetPasswordData } from '@/lib/api/endpoints/auth';

/**
 * Hook to manage password reset functionality
 */
export function useResetPassword() {
  const resetPasswordMutation = useCreateResetPassword();

  const resetPassword = async (data: ResetPasswordData) => {
    return resetPasswordMutation.mutateAsync(data);
  };

  return {
    resetPassword,
    isLoading: resetPasswordMutation.isPending,
    isError: resetPasswordMutation.isError,
    error: resetPasswordMutation.error,
  };
}
