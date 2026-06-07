import * as Yup from 'yup';
import { emailSchema, nameSchema, passwordSchema } from './inputs';

/**
 * Validation schema for magic link authentication
 */
export const magicLinkSchema = Yup.object().shape({
  email: emailSchema.required('oscrat.ui.validation.email-required'),
});

/**
 * Validation schema for login form
 */
export const loginSchema = Yup.object().shape({
  email: emailSchema.required('oscrat.ui.validation.email-required'),
  password: Yup.string().required('oscrat.ui.validation.password-required'),
});

/**
 * Validation schema for forgot password
 */
export const forgotPasswordSchema = Yup.object().shape({
  email: emailSchema.required('oscrat.ui.validation.email-required'),
});

/**
 * Validation schema for password reset
 */
export const resetPasswordSchema = Yup.object().shape({
  password: passwordSchema.required('oscrat.ui.validation.password-required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'oscrat.ui.validation.password-confirm-match')
    .required('oscrat.ui.validation.password-confirm-required'),
});

/**
 * Validation schema for joining with invitation
 */
export const joinWithInvitationSchema = Yup.object().shape({
  firstName: nameSchema.required('oscrat.ui.validation.first-name-required'),
  lastName: nameSchema.required('oscrat.ui.validation.last-name-required'), 
  password: passwordSchema.required('oscrat.ui.validation.password-required'),
  retypePassword: Yup.string()
    .required('oscrat.ui.validation.password-confirm-required')
    .oneOf([Yup.ref('password')], 'oscrat.ui.validation.password-confirm-match'),
});

/**
 * Validation schema for updating password
 */
export const updatePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('oscrat.ui.validation.current-password-required'),
  newPassword: passwordSchema.required('oscrat.ui.validation.new-password-required'),
});

/**
 * Validation schema for updating email
 */
export const updateEmailSchema = Yup.object().shape({
  email: emailSchema.required('oscrat.ui.validation.email-required'),
});

/**
 * Validation schema for updating name
 */
export const updateNameSchema = Yup.object().shape({
  firstName: nameSchema.required('oscrat.ui.validation.first-name-required'),
  lastName: nameSchema.required('oscrat.ui.validation.last-name-required'),
});

/**
 * Validation schema for joining organization with invitation
 */
export const joinOrgWithInvitationSchema = Yup.object().shape({
  name: nameSchema.required('oscrat.ui.validation.name-required-generic'),
  email: emailSchema.required('oscrat.ui.validation.email-required'),
});

// Type exports
export type MagicLinkData = Yup.InferType<typeof magicLinkSchema>;
export type LoginData = Yup.InferType<typeof loginSchema>;
export type ForgotPasswordData = Yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = Yup.InferType<typeof resetPasswordSchema>;
export type JoinWithInvitationData = Yup.InferType<typeof joinWithInvitationSchema>;
export type UpdatePasswordData = Yup.InferType<typeof updatePasswordSchema>;
export type UpdateEmailData = Yup.InferType<typeof updateEmailSchema>;
export type UpdateNameData = Yup.InferType<typeof updateNameSchema>;
export type JoinOrgWithInvitationData = Yup.InferType<typeof joinOrgWithInvitationSchema>;
