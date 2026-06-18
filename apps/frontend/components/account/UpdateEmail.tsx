import { useTranslation } from 'next-i18next';

import Button from '@/components/button';
import { Card } from '@/components/shared';
import { useAccount } from '@/hooks/useAccount';
import type { User } from '@oscrat/model';
import { updateEmailSchema } from '@/lib/validation/auth';
import { useAccountForm } from '@/hooks/useAccountForm';

interface UpdateEmailProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

const UpdateEmail = ({ user, allowEmailChange }: UpdateEmailProps) => {
  const { t } = useTranslation('common');
  const { updateUser, isUpdateUserLoading } = useAccount();

  const formik = useAccountForm({
    initialValues: { email: user.email },
    validationSchema: updateEmailSchema,
    submitFn: updateUser,
    enableReinitialize: true,
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
          <input
            type="email"
            name="email"
            placeholder={t('your-email')}
            value={formik.values.email}
            onChange={formik.handleChange}
            className="border-line text-content-secondary placeholder-content-placeholder focus:border-primary focus:ring-primary rounded-input w-full max-w-md border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2"
            required
            disabled={!allowEmailChange}
          />
        </Card.Body>
        {allowEmailChange && (
          <Card.Footer>
            <Button
              type="submit"
              variant="primary"
              loading={isUpdateUserLoading}
              disabled={!formik.dirty || !formik.isValid}
            >
              {t('save-changes')}
            </Button>
          </Card.Footer>
        )}
      </Card>
    </form>
  );
};

export default UpdateEmail;
