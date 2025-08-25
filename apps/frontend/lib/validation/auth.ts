import * as Yup from 'yup';
import { emailSchema, nameSchema, passwordSchema } from './inputs';

/**
 * Validation schema for magic link authentication
 */
export const magicLinkSchema = Yup.object().shape({
  email: emailSchema.required('Email is required'),
});

/**
 * Validation schema for login form
 */
export const loginSchema = Yup.object().shape({
  email: emailSchema.required('Email is required'),
  password: Yup.string().required('Password is required'),
});

/**
 * Validation schema for forgot password
 */
export const forgotPasswordSchema = Yup.object().shape({
  email: emailSchema.required('Email is required'),
});

/**
 * Validation schema for password reset
 */
export const resetPasswordSchema = Yup.object().shape({
  password: passwordSchema.required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

/**
 * Validation schema for joining with invitation
 */
export const joinWithInvitationSchema = Yup.object().shape({
  firstName: nameSchema.required('First name is required'),
  lastName: nameSchema.required('Last name is required'), 
  password: passwordSchema.required('Password is required'),
});

/**
 * Validation schema for updating password
 */
export const updatePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: passwordSchema.required('New password is required'),
});

/**
 * Validation schema for updating email
 */
export const updateEmailSchema = Yup.object().shape({
  email: emailSchema.required('Email is required'),
});

/**
 * Validation schema for updating name
 */
export const updateNameSchema = Yup.object().shape({
  firstName: nameSchema.required('First name is required'),
  lastName: nameSchema.required('Last name is required'),
});

/**
 * Validation schema for joining organization with invitation
 */
export const joinOrgWithInvitationSchema = Yup.object().shape({
  name: nameSchema.required('Name is required'),
  email: emailSchema.required('Email is required'),
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
