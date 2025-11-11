import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import { useTeamContext } from '@/context/TeamContext';
import { useIncidents } from '@/hooks/oscrat/useIncidents';
import { TabHeader, TabActionButton } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import Table from './table';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import FullScreenModal from '@/components/shared/FullScreenModal';

export default function Index() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug } = useTeamContext();
  const { versionId } = useVersionContext();
  const { teamId, productId } = useProductContext();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);

  const { incidents, isLoading, isListError, listError, deleteIncident } = useIncidents(
    teamId,
    productId,
    versionId
  );

  const handleDelete = (incidentId: string) => {
    setIncidentToDelete(incidentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!incidentToDelete) return;

    try {
      await deleteIncident(incidentToDelete);
      toast.success(t('oscrat.ui.versions.incidents.deleted-successfully'));
      setShowDeleteModal(false);
      setIncidentToDelete(null);
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.versions.incidents.failed-to-delete'))
      );
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setIncidentToDelete(null);
  };

  const handleAddIncident = () => {
    router.push(
      `/teams/${slug}/products/${productId}/versions/${versionId}/incidents/new`
    );
  };

  if (!ready) return null;

  if (isLoading) {
    return <div>{t('oscrat.ui.loading')}</div>;
  }

  if (isListError) {
    return (
      <div className="text-red-600">
        {extractErrorMessage(listError, t('oscrat.ui.versions.incidents.failed-to-load-incidents'))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        <TabHeader title={t('oscrat.ui.versions.incidents.title')}>
          <TabActionButton onClick={handleAddIncident}>
            {t('oscrat.ui.add-incident')}
          </TabActionButton>
        </TabHeader>

        <Table incidents={incidents} onDelete={handleDelete} />
      </div>

      <FullScreenModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title={t('oscrat.ui.versions.incidents.delete-incident')}
        text={t('oscrat.ui.versions.incidents.confirm-delete')}
        cancelButtonText={t('cancel')}
        continueButtonText={t('delete')}
        onCancel={handleCancelDelete}
        onContinue={confirmDelete}
      />
    </div>
  );
}
