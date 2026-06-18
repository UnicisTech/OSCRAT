import { useTranslation } from 'next-i18next';

import Button from '@/components/button';
import { Card, InputWithLabel } from '@/components/shared';
import { useAccount } from '@/hooks/useAccount';
import { updatePasswordSchema } from '@/lib/validation/auth';
import { useAccountForm } from '@/hooks/useAccountForm';

const UpdatePassword = () => {
  const { t } = useTranslation('common');
  const { updatePassword, isUpdatePasswordLoading } = useAccount();

  const formik = useAccountForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
    },
    validationSchema: updatePasswordSchema,
    submitFn: updatePassword,
    errorMessage: 'error.password-update-failed',
    resetOnSuccess: true,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('password')}</Card.Title>
            <Card.Description>{t('change-password-text')}</Card.Description>
          </Card.Header>
          <div className="flex flex-col space-y-3">
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
            />
            <InputWithLabel
              type="password"
              label={t('new-password')}
              name="newPassword"
              placeholder={t('new-password')}
              value={formik.values.newPassword}
              error={
                formik.touched.newPassword && formik.errors.newPassword
                  ? t(formik.errors.newPassword)
                  : undefined
              }
              onChange={formik.handleChange}
            />
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={isUpdatePasswordLoading}
              disabled={!formik.dirty || !formik.isValid}
            >
              {t('change-password')}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UpdatePassword;
