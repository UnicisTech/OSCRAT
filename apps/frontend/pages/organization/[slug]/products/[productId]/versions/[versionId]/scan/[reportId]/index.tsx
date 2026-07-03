import { withProductDetailLayout } from '@/lib/layout-helpers';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useVersionContext } from '@/context/VersionContext';
import { useGetVulnerabilityScanReportDetail } from '@/lib/api/hooks/oscrat/jobs';
import { Loading, Breadcrumb } from '@/components/shared';
import Button from '@/components/button';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import usePagination from '@/hooks/usePagination';
import { FaDownload, FaPlus, FaEye, FaCheckCircle } from 'react-icons/fa';
import { useAttachments } from '@/hooks/useAttachments';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import PaginationControls from '@/components/shared/PaginationControls';
import { tableStyles } from '@/components/oscrat/tableStyles';
import { reportStyles } from '@/components/oscrat/reportStyles';
import { WorkerJobStatus, type ScanVulnerability } from '@oscrat/model';
import ReportStatusMessage from '@/components/oscrat/ReportStatusMessage';
import ActionButton from '@/components/oscrat/ActionButton';
import { formatDateShort } from '@/utils/dateFormat';
import { useTeamContext } from '@/context/TeamContext';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

function getSeverityBadge(
  severity: string,
  t: (key: string) => string
): JSX.Element {
  const severityConfig: Record<string, { color: string; label: string }> = {
    Critical: {
      color: 'border-danger text-content',
      label: t('oscrat.ui.versions.vulnerability-scan.critical'),
    },
    High: {
      color: 'border-warning text-content',
      label: t('oscrat.ui.versions.vulnerability-scan.high'),
    },
    Medium: {
      color: 'border-caution text-content',
      label: t('oscrat.ui.versions.vulnerability-scan.medium'),
    },
    Low: {
      color: 'border-info text-content',
      label: t('oscrat.ui.versions.vulnerability-scan.low'),
    },
    Negligible: {
      color: 'border-content-muted text-content',
      label: t('oscrat.ui.versions.vulnerability-scan.negligible'),
    },
  };

  const config = severityConfig[severity] || {
    color: 'border-content-muted text-content',
    label: severity,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function ReportHeader({
  title,
  downloadLabel,
  onDownload,
  hasAttachment,
}: {
  title: string;
  downloadLabel: string;
  onDownload: () => void;
  hasAttachment: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className={reportStyles.pageTitle}>{title}</h1>
      <Button
        variant="secondary"
        onClick={onDownload}
        disabled={!hasAttachment}
        startIcon={<FaDownload size={14} />}
        text={downloadLabel}
      />
    </div>
  );
}

function SeverityOverview({
  scanData,
  triggeredBy,
  t,
}: {
  scanData: {
    criticalCount?: number;
    highCount?: number;
    mediumCount?: number;
    lowCount?: number;
    negligibleCount?: number;
    scanDate: string;
    grypeVersion: string;
  };
  triggeredBy: string;
  t: (key: string, options?: any) => string;
}) {
  const severityLevels: Array<{
    key: string;
    countKey: keyof typeof scanData;
    color: 'red' | 'orange' | 'yellow' | 'blue' | 'gray';
  }> = [
    { key: 'critical', countKey: 'criticalCount', color: 'red' },
    { key: 'high', countKey: 'highCount', color: 'orange' },
    { key: 'medium', countKey: 'mediumCount', color: 'yellow' },
    { key: 'low', countKey: 'lowCount', color: 'blue' },
    { key: 'negligible', countKey: 'negligibleCount', color: 'gray' },
  ];

  return (
    <div className={reportStyles.card}>
      <h2 className={reportStyles.sectionTitle}>{t('oscrat.ui.overview')}</h2>
      <div className={reportStyles.severityGrid}>
        {severityLevels.map(({ key, countKey, color }) => {
          const count = (scanData[countKey] as number) || 0;
          const isActive = count > 0;

          return (
            <div
              key={key}
              className={`${reportStyles.severityCard.base} ${
                isActive
                  ? reportStyles.severityCard.active(color)
                  : reportStyles.severityCard.inactive
              }`}
            >
              <p
                className={`${reportStyles.severityLabel.base} ${
                  isActive
                    ? reportStyles.severityLabel.active(color)
                    : reportStyles.severityLabel.inactive
                }`}
              >
                {t(`oscrat.ui.versions.vulnerability-scan.${key}`)}
              </p>
              <p
                className={`${reportStyles.severityCount.base} ${
                  isActive
                    ? reportStyles.severityCount.active(color)
                    : reportStyles.severityCount.inactive
                }`}
              >
                {count}
              </p>
            </div>
          );
        })}
      </div>
      <div className={`mt-6 ${reportStyles.metadataGrid}`}>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.scan-date')}
          </p>
          <p className={reportStyles.metadataValue}>
            {formatDateShort(scanData.scanDate)}
          </p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.vulnerability-scan.grype-version')}
          </p>
          <p className={reportStyles.metadataValue}>{scanData.grypeVersion}</p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.triggered-by-label')}
          </p>
          <p className={reportStyles.metadataValue}>{triggeredBy}</p>
        </div>
      </div>
    </div>
  );
}

function VulnerabilitiesTable({
  vulnerabilities,
  currentPage,
  totalPages,
  pageData,
  prevButtonDisabled,
  nextButtonDisabled,
  goToPreviousPage,
  goToNextPage,
  getSeverityBadge,
  t,
  onCreateVulnerability,
  onViewVulnerability,
}: {
  vulnerabilities: ScanVulnerability[];
  currentPage: number;
  totalPages: number;
  pageData: ScanVulnerability[];
  prevButtonDisabled: boolean;
  nextButtonDisabled: boolean;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  getSeverityBadge: (severity: string) => JSX.Element;
  t: (key: string, options?: any) => string;
  onCreateVulnerability: (vuln: ScanVulnerability) => void;
  onViewVulnerability: (vulnerabilityId: string) => void;
}) {
  if (!vulnerabilities || vulnerabilities.length === 0) {
    return (
      <div className={reportStyles.emptyContainer}>
        <p className={reportStyles.emptyText}>
          {t('oscrat.ui.versions.vulnerability-scan.no-vulnerabilities-found')}
        </p>
      </div>
    );
  }

  return (
    <div className={reportStyles.tableCard}>
      <div className={reportStyles.tableHeader}>
        <h2 className="text-content text-lg font-medium">
          {t('oscrat.ui.versions.vulnerability-scan.vulnerabilities-section')}
        </h2>
        <p className={reportStyles.sectionSubtitle}>
          {t('oscrat.ui.versions.vulnerability-scan.vulnerabilities-found', {
            count: vulnerabilities.length,
          })}
        </p>
      </div>
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <thead className={tableStyles.thead}>
            <tr>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerability-scan.table-advisory-id')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerability-scan.table-cve')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerability-scan.table-severity')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerability-scan.table-package')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerability-scan.table-version')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerability-scan.table-fixed-in')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerability-scan.table-description')}
              </th>
              <th className={tableStyles.th}>{t('oscrat.ui.actions')}</th>
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {pageData.map((vuln, index) => (
              <tr key={index} className={tableStyles.tr}>
                <td className={`${tableStyles.td} text-content font-medium`}>
                  <div className="flex items-center gap-2">
                    {vuln.advisoryId}
                    {vuln.existingVulnerability && (
                      <FaCheckCircle
                        className="text-success"
                        size={14}
                        title={t(
                          'oscrat.ui.versions.vulnerability-scan.already-tracked'
                        )}
                      />
                    )}
                  </div>
                </td>
                <td className={tableStyles.td}>{vuln.cve || '-'}</td>
                <td className={tableStyles.td}>
                  {getSeverityBadge(vuln.severity)}
                </td>
                <td className={`${tableStyles.td} text-content`}>
                  {vuln.package}
                </td>
                <td className={tableStyles.td}>{vuln.version}</td>
                <td className={tableStyles.td}>{vuln.fixedIn || '-'}</td>
                <td className={tableStyles.td}>
                  <div className="max-w-md truncate" title={vuln.description}>
                    {vuln.description || '-'}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  {vuln.existingVulnerability ? (
                    <ActionButton
                      onClick={() =>
                        onViewVulnerability(vuln.existingVulnerability!.id)
                      }
                      icon={<FaEye size={12} />}
                      title={t('oscrat.ui.view')}
                    >
                      {t('oscrat.ui.view')}
                    </ActionButton>
                  ) : (
                    <ActionButton
                      onClick={() => onCreateVulnerability(vuln)}
                      icon={<FaPlus size={12} />}
                      title={t('oscrat.ui.create')}
                    >
                      {t('oscrat.ui.create')}
                    </ActionButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {vulnerabilities.length > LISTING_PAGE_SIZE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          showItemCount
          totalItems={vulnerabilities.length}
          itemsPerPage={LISTING_PAGE_SIZE}
        />
      )}
    </div>
  );
}

export default function VulnerabilityScanSummary() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { reportId } = router.query;
  const { teamId, productId, versionId } = useVersionContext();
  const { slug } = useTeamContext();

  const { project } = useOscratProject(teamId, productId);
  const { version: versionData } = useOscratVersion(
    teamId,
    productId,
    versionId
  );

  const { data: report, isLoading } = useGetVulnerabilityScanReportDetail(
    teamId,
    productId,
    versionId,
    reportId as string,
    { enabled: !!reportId }
  );

  const { downloadAttachment } = useAttachments(teamId);

  const scanData = report?.scanData ?? null;
  const vulnerabilities = scanData?.vulnerabilities ?? [];

  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(vulnerabilities, LISTING_PAGE_SIZE);

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/organization/${teamId}/products`,
    },
    {
      label: project?.name || '',
      href: `/organization/${teamId}/products/${productId}`,
    },
    {
      label: versionData?.version || '',
      href: `/organization/${teamId}/products/${productId}/versions/${versionId}?tab=vulnerabilities`,
    },
    {
      label: t('oscrat.ui.versions.vulnerability-scan.report-title'),
      current: true,
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  // Handle not found and non-completed reports
  if (!report || report.status !== WorkerJobStatus.COMPLETED) {
    return <ReportStatusMessage status={report?.status} />;
  }

  const handleDownload = async () => {
    if (!report.attachment) return;

    try {
      await downloadAttachment(report.attachment.id, report.attachment.name);
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

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={reportStyles.cardSection}>
        <ReportHeader
          title={t('oscrat.ui.versions.vulnerability-scan.report-title')}
          downloadLabel={t('oscrat.ui.versions.vulnerability-scan.download')}
          onDownload={handleDownload}
          hasAttachment={!!report.attachment}
        />

        {scanData && (
          <SeverityOverview
            scanData={scanData}
            triggeredBy={
              report.job.triggeredByUser?.name ||
              report.job.triggeredByUser?.email ||
              '-'
            }
            t={t}
          />
        )}

        <VulnerabilitiesTable
          vulnerabilities={vulnerabilities}
          currentPage={currentPage}
          totalPages={totalPages}
          pageData={pageData}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          getSeverityBadge={(severity) => getSeverityBadge(severity, t)}
          t={t}
          onCreateVulnerability={(vuln) => {
            const params = new URLSearchParams({
              prefill: 'true',
              advisoryId: vuln.advisoryId,
              ...(vuln.cve && { cve: vuln.cve }),
              severity: vuln.severity,
              description: vuln.description,
              package: vuln.package,
              version: vuln.version,
            });
            router.push(
              `/organization/${slug}/products/${productId}/versions/${versionId}/vulnerabilities/new?${params.toString()}`
            );
          }}
          onViewVulnerability={(vulnerabilityId) => {
            router.push(
              `/organization/${slug}/products/${productId}/versions/${versionId}/vulnerabilities/${vulnerabilityId}`
            );
          }}
        />
      </div>
    </>
  );
}

VulnerabilityScanSummary.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
