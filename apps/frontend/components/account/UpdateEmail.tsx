import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import type { User } from '@oscrat/model';

import Button from '@/components/button';
import { Alert, Card, InputWithLabel } from '@/components/shared';
import { useChangeEmail } from '@/lib/api/hooks/users';
import { changeEmailSchema } from '@/lib/validation/auth';
import { extractErrorMessage } from '@/lib/utils';

interface UpdateEmailProps {
  user: Partial<User>;
}

const UpdateEmail = ({ user }: UpdateEmailProps) => {
  const { t } = useTranslation('common');
  const changeEmail = useChangeEmail();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: user.email ?? '',
      currentPassword: '',
    },
    validationSchema: changeEmailSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const result = await changeEmail.mutateAsync({
          email: values.email,
          currentPassword: values.currentPassword,
        });

        if (result.pendingEmail) {
          // Deferred: a confirmation link was sent to the new address.
          setPendingEmail(result.pendingEmail);
        } else {
          // Applied immediately (dev / CONFIRM_EMAIL=false).
          setPendingEmail(null);
          toast.success(t('successfully-updated'));
        }

        formik.setFieldValue('currentPassword', '');
      } catch (error) {
        toast.error(extractErrorMessage(error, t('error.update-failed'), t));
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('email-address')}</Card.Title>
            <Card.Description>
              {t('email-address-description')}
            </Card.Description>
          </Card.Header>
          <div className="flex flex-col space-y-3">
            {pendingEmail && (
              <Alert status="info">
                {t('email-change-pending', { email: pendingEmail })}
              </Alert>
            )}
            <InputWithLabel
              type="email"
              label={t('email-address')}
              name="email"
              placeholder={t('your-email')}
              value={formik.values.email}
              error={
                formik.touched.email && formik.errors.email
                  ? t(formik.errors.email)
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            <InputWithLabel
              type="password"
              label={t('current-password')}
              name="currentPassword"
              placeholder={t('current-password')}
              value={formik.values.currentPassword}
              error={
                formik.touched.currentPassword && formik.errors.currentPassword
                  ? t(formik.errors.currentPassword)
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="current-password"
              required
            />
          </div>
        </Card.Body>
        <Card.Footer>
          <Button
            type="submit"
            variant="primary"
            loading={changeEmail.isPending}
            disabled={!formik.dirty || !formik.isValid}
          >
            {t('save-changes')}
          </Button>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UpdateEmail;
