import { useFormik, type FormikConfig, type FormikValues } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { extractErrorMessage } from '@/lib/utils';

interface AccountFormResult {
  success: boolean;
  error?: unknown;
}

interface UseAccountFormConfig<T extends FormikValues> {
  initialValues: T;
  validationSchema: FormikConfig<T>['validationSchema'];
  submitFn: (values: T) => Promise<AccountFormResult>;
  successMessage?: string;
  errorMessage?: string;
  enableReinitialize?: boolean;
  resetOnSuccess?: boolean;
}

export function useAccountForm<T extends FormikValues>({
  initialValues,
  validationSchema,
  submitFn,
  successMessage = 'successfully-updated',
  errorMessage = 'error.update-failed',
  enableReinitialize = false,
  resetOnSuccess = false,
}: UseAccountFormConfig<T>) {
  const { t } = useTranslation('common');

  const formik = useFormik<T>({
    initialValues,
    validationSchema,
    enableReinitialize,
    onSubmit: async (values) => {
      const result = await submitFn(values);

      if (result.success) {
        toast.success(t(successMessage));
        if (resetOnSuccess) {
          formik.resetForm();
        }
      } else {
        toast.error(extractErrorMessage(result.error, t(errorMessage)));
      }
    },
  });

  return formik;
}
