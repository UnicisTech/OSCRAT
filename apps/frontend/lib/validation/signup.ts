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
  firstName: nameSchema.required('oscrat.ui.validation.first-name-required'),
  lastName: nameSchema.required('oscrat.ui.validation.last-name-required'),
  email: emailSchema.required('oscrat.ui.validation.email-required'),
  password: passwordSchema.required('oscrat.ui.validation.password-required'),
  retypePassword: Yup.string()
    .required('oscrat.ui.validation.password-confirm-required')
    .oneOf(
      [Yup.ref('password')],
      'oscrat.ui.validation.password-confirm-match'
    ),
  recaptchaToken: Yup.string().notRequired(),
});

// Type exports
export type UserSignupData = Yup.InferType<typeof userSignupSchema>;
