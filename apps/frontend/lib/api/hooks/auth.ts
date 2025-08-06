import { useMutation } from '@tanstack/react-query';
import { authEndpoints } from '@/lib/api/endpoints/auth';
import type {
  LoginCredentials,
  ForgotPasswordData,
  ResetPasswordData,
  JoinData,
  ResendEmailTokenData,
} from '@/lib/api/endpoints/auth';

export function useCreateLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authEndpoints.login(credentials),
    onSuccess: () => {
      window.location.reload();
    },
  });
}

export function useCreateForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) =>
      authEndpoints.forgotPassword(data),
  });
}

export function useCreateResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => authEndpoints.resetPassword(data),
  });
}

export function useCreateJoin() {
  return useMutation({
    mutationFn: (data: JoinData) => authEndpoints.join(data),
  });
}

export function useCreateResendEmailToken() {
  return useMutation({
    mutationFn: (data: ResendEmailTokenData) =>
      authEndpoints.resendEmailToken(data),
  });
}

export function useCreateSsoVerify() {
  return useMutation({
    mutationFn: ({
      state,
      providerSlug,
    }: {
      state: string;
      providerSlug: string;
    }) => authEndpoints.sso.verify(state, providerSlug),
  });
}
