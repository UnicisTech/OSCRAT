import { EmptyState, WithLoadingAndError } from '@/components/shared';
import Button from '@/components/button';
import Badge from '@/components/shared/Badge';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useApiKeys } from '@/hooks/useApiKeys';
import { extractErrorMessage } from '@/lib/utils';
import type { ApiKey, Team } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import NewAPIKey from './NewAPIKey';
import { formatDateShort } from '@/utils/dateFormat';

interface APIKeysProps {
  team: Team;
}

const APIKeys = ({ team }: APIKeysProps) => {
  const { t } = useTranslation('common');
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  // Use the custom hook
  const { apiKeys, isLoading, error, deleteApiKey } = useApiKeys(team.slug);

  // Delete API Key
  const handleDeleteApiKey = async (apiKey: ApiKey | null) => {
    if (!apiKey) return;

    try {
      await deleteApiKey(apiKey.id);
      setSelectedApiKey(null);
      setConfirmationDialogVisible(false);
      toast.success(t('api-key-deleted'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('error-deleting-api-key')));
    }
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              API Keys
            </h2>
            <p className="text-content-muted text-sm">
              API keys allow you to authenticate with the API.
            </p>
          </div>
          <Button variant="primary" onClick={() => setCreateModalVisible(true)}>
            {t('create-api-key')}
          </Button>
        </div>
        {apiKeys.length === 0 ? (
          <EmptyState
            title={t('no-api-key-title')}
            description={t('no-api-key-description')}
          />
        ) : (
          <>
            <table className="table w-full border-b text-sm">
              <thead className="bg-surface-muted border-line-header border-b">
                <tr>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('name')}
                  </th>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('status')}
                  </th>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('created')}
                  </th>
                  <th className="text-content text-b2 p-4 font-medium">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((apiKey) => {
                  return (
                    <tr key={apiKey.id}>
                      <td>{apiKey.name}</td>
                      <td>
                        <Badge color="success">{t('active')}</Badge>
                      </td>
                      <td>{formatDateShort(apiKey.createdAt)}</td>
                      <td>
                        <Button
                          size="s"
                          tone="danger"
                          variant="secondary"
                          onClick={() => {
                            setSelectedApiKey(apiKey);
                            setConfirmationDialogVisible(true);
                          }}
                        >
                          {t('revoke')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <ConfirmationDialog
              title={t('revoke-api-key')}
              visible={confirmationDialogVisible}
              onConfirm={() => handleDeleteApiKey(selectedApiKey)}
              onCancel={() => setConfirmationDialogVisible(false)}
              cancelText={t('cancel')}
              confirmText={t('revoke-api-key')}
            >
              {t('revoke-api-key-confirm')}
            </ConfirmationDialog>
          </>
        )}
        <NewAPIKey
          team={team}
          createModalVisible={createModalVisible}
          setCreateModalVisible={setCreateModalVisible}
        />
      </div>
    </WithLoadingAndError>
  );
};

export default APIKeys;
