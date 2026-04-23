import React, { useState, useMemo } from 'react';
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
import FullScreenModal from '@/components/shared/FullScreenModal';
import { OscratProductVulnerabilityStatus } from '@oscrat/model';
import normalizeText from '@/utils/normalizeText';

export default function Index() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug } = useTeamContext();
  const { versionId } = useVersionContext();
  const { teamId, productId } = useProductContext();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vulnerabilityToDelete, setVulnerabilityToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const { vulnerabilities, isLoading, isError, error, deleteVulnerability } = useVulnerabilities(
    teamId,
    productId,
    versionId
  );

  const filteredVulnerabilities = useMemo(() => {
    if (!vulnerabilities || statusFilter === 'All') return vulnerabilities || [];
    return vulnerabilities.filter((v) => v.status === statusFilter);
  }, [vulnerabilities, statusFilter]);

  const handleDelete = (vulnerabilityId: string) => {
    setVulnerabilityToDelete(vulnerabilityId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vulnerabilityToDelete) return;

    try {
      await deleteVulnerability(vulnerabilityToDelete);
      toast.success(t('oscrat.ui.versions.vulnerabilities.deleted-successfully'));
      setShowDeleteModal(false);
      setVulnerabilityToDelete(null);
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.versions.vulnerabilities.failed-to-delete'))
      );
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setVulnerabilityToDelete(null);
  };

  const handleAddVulnerability = () => {
    router.push(
      `/organization/${slug}/products/${productId}/versions/${versionId}/vulnerabilities/new`
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
          <div className="flex items-center space-x-2">
            <label htmlFor="vuln-status-filter" className="text-sm font-medium text-gray-900">
              {t('status')}
            </label>
            <select
              id="vuln-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">{t('all')}</option>
              {Object.values(OscratProductVulnerabilityStatus).map((status) => (
                <option key={status} value={status}>
                  {normalizeText(status)}
                </option>
              ))}
            </select>
          </div>
          <TabActionButton onClick={handleAddVulnerability}>
            {t('oscrat.ui.add-vulnerability')}
          </TabActionButton>
        </TabHeader>

        <Table vulnerabilities={filteredVulnerabilities} onDelete={handleDelete} />
      </div>

      <FullScreenModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title={t('oscrat.ui.versions.vulnerabilities.delete-vulnerability')}
        text={t('oscrat.ui.versions.vulnerabilities.confirm-delete')}
        cancelButtonText={t('cancel')}
        continueButtonText={t('delete')}
        onCancel={handleCancelDelete}
        onContinue={confirmDelete}
      />
    </div>
  );
}
