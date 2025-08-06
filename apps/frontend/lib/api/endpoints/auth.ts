import { api } from '@/lib/api/client';

export type LoginCredentials = {
  email: string;
  password: string;
  recaptchaToken: string;
};

export type ForgotPasswordData = {
  email: string;
  recaptchaToken: string;
};

export type ResetPasswordData = {
  token: string;
  password: string;
  recaptchaToken: string;
};

export type JoinData = {
  name: string;
  email: string;
  password: string;
  recaptchaToken: string;
};

export type ResendEmailTokenData = {
  email: string;
  recaptchaToken: string;
};

export const authEndpoints = {
  login: (credentials: LoginCredentials) =>
    api.post<void>('/auth/login', credentials),

  forgotPassword: (data: ForgotPasswordData) =>
    api.post<void>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordData) =>
    api.post<void>('/auth/reset-password', data),

  join: (data: JoinData) => api.post<void>('/auth/join', data),

  resendEmailToken: (data: ResendEmailTokenData) =>
    api.post<void>('/auth/resend-email-token', data),

  sso: {
    verify: (state: string, providerSlug: string) =>
      api.get<void>(`/auth/sso/verify?state=${state}&provider=${providerSlug}`),
  },
};
