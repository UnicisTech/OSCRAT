import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import { useTeamContext } from '@/context/TeamContext';
import { useVulnerabilities } from '@/hooks/oscrat/useVulnerabilities';
import { TabHeader, TabActionButton } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import Table from './table';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';

export default function Index() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug } = useTeamContext();
  const { versionId } = useVersionContext();
  const { teamId, productId } = useProductContext();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vulnerabilityToDelete, setVulnerabilityToDelete] = useState<string | null>(null);

  const { vulnerabilities, isLoading, isError, error, deleteVulnerability } = useVulnerabilities(
    teamId,
    productId,
    versionId
  );

  const handleDelete = (vulnerabilityId: string) => {
    setVulnerabilityToDelete(vulnerabilityId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vulnerabilityToDelete) return;

    try {
      await deleteVulnerability(vulnerabilityToDelete);
      toast.success(t('oscrat.ui.versions.vulnerabilities.deleted-successfully'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.versions.vulnerabilities.failed-to-delete'))
      );
    } finally {
      setVulnerabilityToDelete(null);
    }
  };

  const handleAddVulnerability = () => {
    router.push(
      `/teams/${slug}/products/${productId}/versions/${versionId}/vulnerabilities/new`
    );
  };

  if (!ready) return null;

  if (isLoading) {
    return <div>{t('oscrat.ui.loading')}</div>;
  }

  if (isError) {
    return (
      <div className="text-red-600">
        {extractErrorMessage(error, t('oscrat.ui.versions.vulnerabilities.failed-to-load-vulnerabilities'))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        <TabHeader title={t('oscrat.ui.versions.vulnerabilities.title')}>
          <TabActionButton onClick={handleAddVulnerability}>
            {t('oscrat.ui.add-vulnerability')}
          </TabActionButton>
        </TabHeader>

        <Table vulnerabilities={vulnerabilities} onDelete={handleDelete} />
      </div>

      <ConfirmationDialog
        visible={showDeleteModal}
        title={t('oscrat.ui.versions.vulnerabilities.delete-vulnerability')}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setVulnerabilityToDelete(null);
        }}
        confirmText={t('delete')}
        cancelText={t('cancel')}
      >
        {t('oscrat.ui.versions.vulnerabilities.confirm-delete')}
      </ConfirmationDialog>
    </div>
  );
}
