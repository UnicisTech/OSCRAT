import { Error, Loading } from '@/components/shared';
import type { Team } from '@oscrat/model';
import type { FormikHelpers } from 'formik';
import { useWebhook } from 'hooks/useWebhook';
import { useWebhooks } from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React from 'react';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';
import type { WebookFormSchema } from 'types';
import { extractErrorMessage } from '@/lib/utils';

import ModalForm from './Form';

const EditWebhook = ({
  visible,
  setVisible,
  team,
  endpoint,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
  endpoint: EndpointOut;
}) => {
  const { isLoading, isError, webhook, error } = useWebhook(
    team.slug,
    endpoint.id
  );
  const { t } = useTranslation('common');
  const { updateWebhook } = useWebhooks(team.slug);

  if (isLoading || !webhook) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={error?.message || 'An error occurred'} />;
  }

  const onSubmit = async (
    values: WebookFormSchema,
    formikHelpers: FormikHelpers<WebookFormSchema>
  ) => {
    try {
      await updateWebhook(endpoint.id, values);
      toast.success(t('webhook-updated'));
      setVisible(false);
      formikHelpers.resetForm();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('webhook-update-failed')));
    }
  };

  return (
    <ModalForm
      visible={visible}
      setVisible={setVisible}
      initialValues={{
        name: webhook.description as string,
        url: webhook.url,
        eventTypes: webhook.filterTypes as string[],
      }}
      onSubmit={onSubmit}
      title={t('edit-webhook-endpoint')}
    />
  );
};

export default EditWebhook;
