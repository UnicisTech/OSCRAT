import type { Team } from '@prisma/client';
import type { FormikHelpers } from 'formik';
import { useWebhooks } from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React from 'react';
import toast from 'react-hot-toast';
import type { WebookFormSchema } from 'types';
import { extractErrorMessage } from '@/lib/utils';

import ModalForm from './Form';

const CreateWebhook = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { createWebhook } = useWebhooks(team.slug);
  const { t } = useTranslation('common');

  const onSubmit = async (
    values: WebookFormSchema,
    formikHelpers: FormikHelpers<WebookFormSchema>
  ) => {
    try {
      await createWebhook(values);
      toast.success(t('webhook-created'));
      setVisible(false);
      formikHelpers.resetForm();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('webhook-creation-failed')));
    }
  };

  return (
    <ModalForm
      visible={visible}
      setVisible={setVisible}
      initialValues={{
        name: '',
        url: '',
        eventTypes: [],
      }}
      onSubmit={onSubmit}
      title={t('create-webhook')}
    />
  );
};

export default CreateWebhook;
