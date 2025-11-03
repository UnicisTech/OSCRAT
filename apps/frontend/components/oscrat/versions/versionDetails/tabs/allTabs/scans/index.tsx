import Table from './table';
import { useOscratVersionVulnerabilityScanReports } from '@/hooks/oscrat/useOscratJobs';
import { useAttachments } from '@/hooks/useAttachments';
import toast from 'react-hot-toast';
import { useVersionContext } from '@/context/VersionContext';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from 'next-i18next';
import { HiOutlineRefresh } from 'react-icons/hi';

export default function Vulnerabilities() {
  const { teamId, productId, versionId } = useVersionContext();
  const { t } = useTranslation('common');

  const {
    reports,
    deleteVulnerabilityScanReport,
    refreshReports,
  } = useOscratVersionVulnerabilityScanReports(teamId, productId, versionId);

  const { downloadAttachment } = useAttachments();

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
          t('oscrat.ui.versions.vulnerability-scan.failed-download-file')
        )
      );
    }
  };

  const handleDelete = async (reportId: string) => {
    if (
      !window.confirm(t('oscrat.ui.versions.vulnerability-scan.confirm-delete-job'))
    ) {
      return;
    }

    try {
      await deleteVulnerabilityScanReport(reportId);
      toast.success(t('oscrat.ui.versions.vulnerability-scan.job-deleted'));
      await refreshReports();
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.vulnerability-scan.failed-delete-job')
        )
      );
    }
  };

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        {/* Header with title and actions */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t('oscrat.ui.versions.vulnerability-scan.scan-jobs')}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              title={t('refresh')}
            >
              <HiOutlineRefresh className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Table
          reports={reports}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
