import ImportModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/configuration/modal';
import Table from '@/components/oscrat/versions/versionDetails/tabs/allTabs/configuration/table';
import { TabHeader, TabActionButton } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { useOscratVersionConfigurationScanReports } from '@/hooks/oscrat/useOscratJobs';
import { useAttachments } from '@/hooks/useAttachments';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useVersionContext } from '@/context/VersionContext';
import { extractErrorMessage, extractTranslatedErrorMessage } from '@/lib/utils';
import { useTranslation } from 'next-i18next';
import { HiOutlineRefresh } from 'react-icons/hi';

export default function Configuration() {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const { teamId, productId, versionId } = useVersionContext();
  const { t } = useTranslation('common');

  const {
    reports,
    createFileConfigurationScanReport,
    deleteConfigurationScanReport,
    refreshReports,
  } = useOscratVersionConfigurationScanReports(teamId, productId, versionId);

  const { downloadAttachment } = useAttachments();

  const handleFileImportAsReport = async (file: File) => {
    try {
      await createFileConfigurationScanReport(file);
      toast.success(
        t('oscrat.ui.config-scan-job-created', { filename: file.name })
      );
      await refreshReports();
    } catch (error: unknown) {
      toast.error(
        extractTranslatedErrorMessage(
          error,
          t,
          t('oscrat.ui.versions.configuration.failed-create-file-job')
        )
      );
    }
  };

  const handleRefresh = async () => {
    await refreshReports();
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      await downloadAttachment(id, filename);
      toast.success(t('oscrat.ui.download-starting'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.configuration.failed-download-file')
        )
      );
    }
  };

  const handleDelete = async (reportId: string) => {
    if (
      !window.confirm(t('oscrat.ui.versions.configuration.confirm-delete-job'))
    ) {
      return;
    }

    try {
      await deleteConfigurationScanReport(reportId);
      toast.success(t('oscrat.ui.versions.configuration.job-deleted'));
      await refreshReports();
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.configuration.failed-delete-job')
        )
      );
    }
  };

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        <TabHeader title={t('oscrat.ui.versions.configuration.scan-jobs')}>
          <TabActionButton
            onClick={handleRefresh}
            variant="icon-only"
            title={t('refresh')}
            icon={<HiOutlineRefresh className="h-4 w-4" />}
          >
            <span className="sr-only">{t('refresh')}</span>
          </TabActionButton>
          <TabActionButton onClick={() => setImportModalOpen(true)}>
            {t('import')}
          </TabActionButton>
        </TabHeader>

        <Table
          reports={reports}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportAsJob={handleFileImportAsReport}
      />
    </div>
  );
}
