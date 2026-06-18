import Table from './table';
import {
  TabHeader,
  TabActionButton,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
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

  const { reports, deleteVulnerabilityScanReport, refreshReports } =
    useOscratVersionVulnerabilityScanReports(teamId, productId, versionId);

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
      !window.confirm(
        t('oscrat.ui.versions.vulnerability-scan.confirm-delete-job')
      )
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
    <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
      <div className="w-full">
        <TabHeader title={t('oscrat.ui.versions.vulnerability-scan.scan-jobs')}>
          <TabActionButton
            onClick={handleRefresh}
            variant="icon-only"
            title={t('refresh')}
            icon={<HiOutlineRefresh className="h-4 w-4" />}
          >
            <span className="sr-only">{t('refresh')}</span>
          </TabActionButton>
        </TabHeader>

        <Table
          reports={reports}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
