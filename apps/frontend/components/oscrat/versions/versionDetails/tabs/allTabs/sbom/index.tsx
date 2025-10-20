import ImportModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/sbom/modal';
import Table from '@/components/oscrat/versions/versionDetails/tabs/allTabs/sbom/table';
import { useOscratRepository } from '@/hooks/oscrat/useOscratRepository';
import { useOscratVersionSbomReports } from '@/hooks/oscrat/useOscratJobs';
import { useCreateSbomReportVulnerabilityScan } from '@/lib/api/hooks/oscrat/jobs';
import { useAttachments } from '@/hooks/useAttachments';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useVersionContext } from '@/context/VersionContext';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from 'next-i18next';
import { HiOutlineRefresh } from 'react-icons/hi';

export default function Sbom() {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const { teamId, productId, versionId, versionContext } = useVersionContext();
  const { t } = useTranslation('common');

  const { repository } = useOscratRepository(teamId, productId, versionId);
  const { version } = versionContext;

  const {
    reports,
    createRepoSbomReport,
    createFileSbomReport,
    deleteSbomReport,
    isLoading: isCreatingReport,
    refreshReports,
  } = useOscratVersionSbomReports(teamId, productId, versionId);

  const createSbomReportVulnerabilityScanMutation = useCreateSbomReportVulnerabilityScan(
    teamId,
    productId,
    versionId
  );

  const { downloadAttachment } = useAttachments();
  const handleCreateRepoSbomReport = async () => {
    if (!repository?.id) {
      toast.error(t('oscrat.ui.repository-not-configured'));
      return;
    }

    try {
      await createRepoSbomReport({ repositoryId: repository.id });
      toast.success(t('oscrat.ui.repo-sbom-job-created'));
      await refreshReports();
    } catch (error: unknown) {
      toast.error(
        `${t('oscrat.ui.versions.sbom.failed-create-repo-job')}: ${extractErrorMessage(error, t('oscrat.ui.versions.sbom.failed-create-repo-job'))}`
      );
    }
  };

  const handleFileImportAsReport = async (file: File) => {
    try {
      await createFileSbomReport(file);
      toast.success(
        t('oscrat.ui.file-sbom-job-created', { filename: file.name })
      );
      await refreshReports();
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.sbom.failed-create-file-job')
        )
      );
    }
  };

  const handleGenerate = () => handleCreateRepoSbomReport();

  const handleRefresh = async () => {
    await refreshReports();
  };

  const handleScanVulnerabilities = async (reportId: string) => {
    try {
      await createSbomReportVulnerabilityScanMutation.mutateAsync({
        sbomReportId: reportId,
      });
      toast.success(t('oscrat.ui.vulnerability-scan-started'));
      await refreshReports();
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-start-scan'))
      );
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      await downloadAttachment(id, filename);
      toast.success(t('oscrat.ui.download-starting'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.sbom.failed-download-file')
        )
      );
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm(t('oscrat.ui.versions.sbom.confirm-delete-job'))) {
      return;
    }

    try {
      await deleteSbomReport(reportId);
      toast.success(t('oscrat.ui.versions.sbom.job-deleted'));
      await refreshReports();
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.sbom.failed-delete-job')
        )
      );
    }
  };

  const hasRepositoryDefined =
    version?.repository && Object.keys(version.repository).length > 0;

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        {/* Header with title and actions */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t('oscrat.ui.versions.sbom.generation-jobs')}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              title={t('refresh')}
            >
              <HiOutlineRefresh className="h-4 w-4" />
            </button>
            <button
              onClick={() => setImportModalOpen(true)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              {t('import')}
            </button>
            <button
              onClick={
                hasRepositoryDefined && !isCreatingReport
                  ? handleGenerate
                  : undefined
              }
              disabled={!hasRepositoryDefined || isCreatingReport}
              title={
                !hasRepositoryDefined
                  ? t('oscrat.ui.to-generate-sbom')
                  : undefined
              }
              className={`rounded-md border px-4 py-2 text-sm font-medium ${
                hasRepositoryDefined && !isCreatingReport
                  ? 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              }`}
            >
              {isCreatingReport ? `${t('generate')}...` : t('generate')}
            </button>
          </div>
        </div>

        <Table
          reports={reports}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onScan={handleScanVulnerabilities}
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
