import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Button, Input } from 'react-daisyui';

import { Card } from '@/components/shared';
import { useAccount } from '@/hooks/useAccount';
import { extractErrorMessage } from '@/lib/utils';
import type { User } from '@oscrat/model';

const schema = Yup.object().shape({
  email: Yup.string().required(),
});

interface UpdateEmailProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

const UpdateEmail = ({ user, allowEmailChange }: UpdateEmailProps) => {
  const { t } = useTranslation('common');
  const { updateUser, isUpdateUserLoading } = useAccount();

  const formik = useFormik({
    initialValues: {
      email: user.email,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const result = await updateUser(values);

      if (result.success) {
        toast.success(t('successfully-updated'));
        formik.resetForm({ values });
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
            <Card.Title>{t('email-address')}</Card.Title>
            <Card.Description>
              {t('email-address-description')}
            </Card.Description>
          </Card.Header>
          <Input
            type="email"
            name="email"
            placeholder={t('your-email')}
            value={formik.values.email}
            onChange={formik.handleChange}
            className="w-full max-w-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
            required
            disabled={!allowEmailChange}
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

export default UpdateEmail;
