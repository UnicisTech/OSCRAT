import * as Yup from 'yup';
import {
  nameSchema,
  emailSchema,
  passwordSchema,
} from '@/lib/validation/inputs';

/**
 * User signup schema
 */
export const userSignupSchema = Yup.object({
  firstName: nameSchema.required('First name is required'),
  lastName: nameSchema.required('Last name is required'),
  email: emailSchema.required('Email is required'),
  password: passwordSchema.required('Password is required'),
  retypePassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  recaptchaToken: Yup.string().notRequired(),
});

// Type exports
export type UserSignupData = Yup.InferType<typeof userSignupSchema>;
