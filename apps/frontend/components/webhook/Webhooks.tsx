import { WithLoadingAndError } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { Team } from '@oscrat/model';
import { useWebhooks } from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';

import Button from '@/components/button';
import CreateWebhook from './CreateWebhook';
import EditWebhook from './EditWebhook';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { extractErrorMessage } from '@/lib/utils';
import { formatDateTime } from '@/utils/dateFormat';

const Webhooks = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const [createWebhookVisible, setCreateWebhookVisible] = useState(false);
  const [updateWebhookVisible, setUpdateWebhookVisible] = useState(false);
  const [endpoint, setEndpoint] = useState<EndpointOut | null>(null);

  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    React.useState(false);

  const [selectedWebhook, setSelectedWebhook] = useState<EndpointOut | null>(
    null
  );

  const { isLoading, isError, webhooks, deleteWebhook } = useWebhooks(
    team.slug
  );

  const handleDeleteWebhook = async (webhook: EndpointOut | null) => {
    if (!webhook) return;

    try {
      await deleteWebhook(webhook.id);
      toast.success(t('webhook-deleted'));
      setConfirmationDialogVisible(false);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('webhook-deletion-failed')));
    }
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              Webhooks
            </h2>
            <p className="text-content-muted text-sm">
              Webhooks are used to send notifications to your external apps.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setCreateWebhookVisible(!createWebhookVisible)}
          >
            {t('add-webhook')}
          </Button>
        </div>
        {webhooks?.length === 0 ? (
          <EmptyState title={t('no-webhook-title')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full border-b text-sm">
              <thead className="bg-surface-muted border-line-header border-b">
                <tr>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('name')}
                  </th>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('url')}
                  </th>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('created-at')}
                  </th>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('action')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {webhooks?.map((webhook) => {
                  return (
                    <tr key={webhook.id}>
                      <td>{webhook.description}</td>
                      <td>{webhook.url}</td>
                      <td>{formatDateTime(webhook.createdAt)}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Button
                            size="s"
                            variant="secondary"
                            onClick={() => {
                              setEndpoint(webhook);
                              setUpdateWebhookVisible(!updateWebhookVisible);
                            }}
                          >
                            {t('edit')}
                          </Button>
                          <Button
                            size="s"
                            tone="danger"
                            variant="secondary"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setConfirmationDialogVisible(true);
                            }}
                          >
                            {t('remove')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {endpoint && (
          <EditWebhook
            visible={updateWebhookVisible}
            setVisible={setUpdateWebhookVisible}
            team={team}
            endpoint={endpoint}
          />
        )}
      </div>
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => handleDeleteWebhook(selectedWebhook)}
        title={t('confirm-delete-webhook')}
      >
        {t('delete-webhook-warning')}
      </ConfirmationDialog>
      <CreateWebhook
        visible={createWebhookVisible}
        setVisible={setCreateWebhookVisible}
        team={team}
      />
    </WithLoadingAndError>
  );
};

export default Webhooks;
