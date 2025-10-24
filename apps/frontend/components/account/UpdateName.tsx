import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { User } from '@oscrat/model';

import { Card, InputWithLabel } from '@/components/shared';
import { useAccount } from '@/hooks/useAccount';
import { extractErrorMessage } from '@/lib/utils';
import { updateNameSchema } from '@/lib/validation/auth';

const UpdateName = ({ user }: { user: Partial<User> }) => {
  const { t } = useTranslation('common');
  const { updateUser, isUpdateUserLoading } = useAccount();

  const formik = useFormik({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    enableReinitialize: true,
    validationSchema: updateNameSchema,
    onSubmit: async (values) => {
      const result = await updateUser(values);

      if (result.success) {
        toast.success(t('successfully-updated'));
      } else {
        toast.error(
          extractErrorMessage(result.error, t('error.update-failed'))
        );
      }
    },
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
            label={t('first-name')}
            name="firstName"
            placeholder={t('your-first-name')}
            value={formik.values.firstName}
            error={
              formik.touched.firstName && formik.errors.firstName 
                ? t(formik.errors.firstName) 
                : undefined
            }
            onChange={formik.handleChange}
            required
          />
          <InputWithLabel
            type="text"
            label={t('last-name')}
            name="lastName"
            placeholder={t('your-last-name')}
            value={formik.values.lastName}
            error={
              formik.touched.lastName && formik.errors.lastName 
                ? t(formik.errors.lastName) 
                : undefined
            }
            onChange={formik.handleChange}
            required
          />
        </Card.Body>
        <Card.Footer>
          <Button
            type="submit"
            color="primary"
            loading={isUpdateUserLoading}
            disabled={!formik.dirty || !formik.isValid}
            size="md"
          >
            {t('save-changes')}
          </Button>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UpdateName;
