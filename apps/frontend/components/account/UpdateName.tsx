import { useTranslation } from 'next-i18next';
import type { User } from '@oscrat/model';

import Button from '@/components/button';
import { Card, InputWithLabel } from '@/components/shared';
import { useAccount } from '@/hooks/useAccount';
import { updateNameSchema } from '@/lib/validation/auth';
import { useAccountForm } from '@/hooks/useAccountForm';

const UpdateName = ({ user }: { user: Partial<User> }) => {
  const { t } = useTranslation('common');
  const { updateUser, isUpdateUserLoading } = useAccount();

  const formik = useAccountForm({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    validationSchema: updateNameSchema,
    submitFn: updateUser,
    enableReinitialize: true,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('name')}</Card.Title>
            <Card.Description>{t('name-appearance')}</Card.Description>
          </Card.Header>
          <InputWithLabel
            type="text"
            label={
              <>
                {t('first-name')}
                <span className="text-danger ml-1">*</span>
              </>
            }
            name="firstName"
            placeholder={t('your-first-name')}
            value={formik.values.firstName}
            error={
              formik.touched.firstName && formik.errors.firstName
                ? t(formik.errors.firstName)
                : undefined
            }
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
          />
          <InputWithLabel
            type="text"
            label={
              <>
                {t('last-name')}
                <span className="text-danger ml-1">*</span>
              </>
            }
            name="lastName"
            placeholder={t('your-last-name')}
            value={formik.values.lastName}
            error={
              formik.touched.lastName && formik.errors.lastName
                ? t(formik.errors.lastName)
                : undefined
            }
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
          />
        </Card.Body>
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
      </Card>
    </form>
  );
};

export default UpdateName;
