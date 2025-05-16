import { useMutation } from '@tanstack/react-query';
import { passwordEndpoints } from '@/lib/api/endpoints/password';
import type { PasswordValidationData } from '@/lib/api/endpoints/password';

export function useCreatePasswordValidation() {
  return useMutation({
    mutationFn: (data: PasswordValidationData) =>
      passwordEndpoints.validate(data),
  });
}
