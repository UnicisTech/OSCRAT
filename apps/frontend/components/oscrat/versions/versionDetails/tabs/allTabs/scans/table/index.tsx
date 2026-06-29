import React, { useMemo } from 'react';
import { FaDownload, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { VulnerabilityScanReportDetails } from '@oscrat/model/operations';
import { WorkerJobStatus } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import { getErrorCodeTranslationKey } from '@/utils/errorCodeTranslation';
import ActionButton from '@/components/oscrat/ActionButton';
import { tableStyles } from '@/components/oscrat/tableStyles';
import PaginationControls from '@/components/shared/PaginationControls';
import { ShortUuidButton } from '@/components/shared';
import { formatDateShort } from '@/utils/dateFormat';
import { sortByCreatedAtDesc } from '@/utils/sortItems';
import {
  TableWrapper,
  TableHeader,
  TableRow,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

interface VulnerabilityScanTableProps {
  reports?: VulnerabilityScanReportDetails[];
  onDownload: (id: string, filename: string) => void;
  onDelete: (reportId: string) => void;
  itemsPerPage?: number;
}

const Table: React.FC<VulnerabilityScanTableProps> = ({
  reports,
  onDownload,
  onDelete,
  itemsPerPage,
}) => {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug, productId, versionId } = router.query;

  const pageSize = itemsPerPage || LISTING_PAGE_SIZE;
  const sortedReports = useMemo(() => sortByCreatedAtDesc(reports), [reports]);
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<VulnerabilityScanReportDetails>(sortedReports, pageSize);

  if (!ready) {
    return null;
  }

  const formatDuration = (start: Date, end: Date) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusBadge = (report: VulnerabilityScanReportDetails) => {
    const statusConfig = {
      [WorkerJobStatus.COMPLETED]: {
        color: 'text-success',
        label: t('oscrat.ui.versions.vulnerability-scan.completed'),
      },
      [WorkerJobStatus.IN_PROGRESS]: {
        color: 'text-primary',
        label: t('oscrat.ui.versions.vulnerability-scan.in-progress'),
      },
      [WorkerJobStatus.FAILED]: {
        color: 'text-danger',
        label: t('oscrat.ui.versions.vulnerability-scan.failed'),
      },
      [WorkerJobStatus.PENDING]: {
        color: 'text-content-secondary',
        label: t('oscrat.ui.versions.vulnerability-scan.pending'),
      },
      [WorkerJobStatus.CANCELLED]: {
        color: 'text-content-secondary',
        label: t('oscrat.ui.versions.vulnerability-scan.cancelled'),
      },
    };

    const config = statusConfig[report.status] || {
      color: 'text-content-secondary',
      label: t('oscrat.ui.unknown'),
    };

    return (
      <span
        className={`flex items-center ${config.color}`}
        title={
          report.status === WorkerJobStatus.FAILED && report.job.errCode
            ? `Error ${report.job.errCode}: ${t(getErrorCodeTranslationKey(report.job.errCode))}`
            : undefined
        }
      >
        <span className="mr-1">●</span>
        {config.label}
      </span>
    );
  };

  if (!sortedReports.length) {
    return (
      <div className="text-content-muted flex flex-col items-center justify-center py-12">
        <p className="text-sm">{t('oscrat.ui.no-vulnerability-scans-added')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-card w-full">
      <TableWrapper>
        <table className={tableStyles.table}>
          <TableHeader
            columns={[
              { label: t('status'), className: 'w-[9%]' },
              { label: t('oscrat.ui.source'), className: 'text-center w-[8%]' },
              {
                label: t('oscrat.ui.versions.vulnerability-scan.started'),
                className: 'text-center w-[9%]',
              },
              {
                label: t('oscrat.ui.versions.vulnerability-scan.triggered-by'),
                className: 'text-center w-[12%]',
              },
              {
                label: t('oscrat.ui.versions.vulnerability-scan.duration'),
                className: 'text-center w-[7%]',
              },
              {
                label: t('oscrat.ui.versions.vulnerability-scan.total'),
                className: 'text-center w-[6%]',
              },
              {
                label: t('oscrat.ui.versions.vulnerability-scan.critical'),
                className: 'text-center w-[6%]',
              },
              {
                label: t('oscrat.ui.versions.vulnerability-scan.high'),
                className: 'text-center w-[6%]',
              },
              {
                label: t('oscrat.ui.versions.vulnerability-scan.medium'),
                className: 'text-center w-[6%]',
              },
              {
                label: t('oscrat.ui.versions.vulnerability-scan.low'),
                className: 'text-center w-[6%]',
              },
              { label: t('actions'), className: 'text-center w-[25%]' },
            ]}
          />
          <tbody className={tableStyles.tbody}>
            {pageData.map((report) => (
              <TableRow
                key={report.id}
                className="cursor-pointer"
                onClick={() =>
                  router.push(
                    `/organization/${slug}/products/${productId}/versions/${versionId}/scan/${report.id}`
                  )
                }
              >
                <td className={tableStyles.td}>{getStatusBadge(report)}</td>
                <td className={tableStyles.tdCenter}>
                  {report.sourceSbomReport ? (
                    <ShortUuidButton
                      uuid={report.sourceSbomReport.id}
                      href={`/organization/${slug}/products/${productId}/versions/${versionId}/sbom/${report.sourceSbomReport.id}`}
                    />
                  ) : (
                    <span className="text-content-placeholder">-</span>
                  )}
                </td>
                <td className={tableStyles.tdCenter}>
                  {formatDateShort(report.job.createdAt)}
                </td>
                <td
                  className={tableStyles.tdCenter}
                  title={
                    report.job.triggeredByUser?.name ||
                    report.job.triggeredByUser?.email ||
                    '-'
                  }
                >
                  {report.job.triggeredByUser?.name ||
                    report.job.triggeredByUser?.email ||
                    '-'}
                </td>
                <td className={tableStyles.tdCenter}>
                  {report.status === WorkerJobStatus.COMPLETED &&
                  report.job.processStartTime &&
                  report.job.processEndTime
                    ? formatDuration(
                        report.job.processStartTime,
                        report.job.processEndTime
                      )
                    : '-'}
                </td>
                <td className={tableStyles.tdCenter}>
                  {report.scanData?.totalVulnerabilities ?? '-'}
                </td>
                <td className={tableStyles.tdCenter}>
                  <span
                    className={
                      report.scanData?.criticalCount
                        ? 'text-danger font-semibold'
                        : ''
                    }
                  >
                    {report.scanData?.criticalCount ?? '-'}
                  </span>
                </td>
                <td className={tableStyles.tdCenter}>
                  <span
                    className={
                      report.scanData?.highCount
                        ? 'text-warning font-semibold'
                        : ''
                    }
                  >
                    {report.scanData?.highCount ?? '-'}
                  </span>
                </td>
                <td className={tableStyles.tdCenter}>
                  <span
                    className={
                      report.scanData?.mediumCount ? 'text-caution' : ''
                    }
                  >
                    {report.scanData?.mediumCount ?? '-'}
                  </span>
                </td>
                <td className={tableStyles.tdCenter}>
                  <span
                    className={report.scanData?.lowCount ? 'text-primary' : ''}
                  >
                    {report.scanData?.lowCount ?? '-'}
                  </span>
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <div
                    className="flex items-center justify-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButton
                      onClick={() =>
                        report.attachment &&
                        onDownload(report.attachment.id, report.attachment.name)
                      }
                      disabled={
                        report.status !== WorkerJobStatus.COMPLETED ||
                        !report.attachment
                      }
                      icon={<FaDownload size={12} />}
                      title={t(
                        'oscrat.ui.versions.vulnerability-scan.download-report'
                      )}
                    >
                      {t('oscrat.ui.versions.vulnerability-scan.download')}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onDelete(report.id)}
                      disabled={
                        report.status !== WorkerJobStatus.COMPLETED &&
                        report.status !== WorkerJobStatus.FAILED
                      }
                      icon={<FaTrash size={12} />}
                      title={
                        report.status === WorkerJobStatus.COMPLETED ||
                        report.status === WorkerJobStatus.FAILED
                          ? t(
                              'oscrat.ui.versions.vulnerability-scan.delete-job'
                            )
                          : t(
                              'oscrat.ui.versions.vulnerability-scan.delete-only-completed-failed'
                            )
                      }
                    >
                      {t('oscrat.ui.versions.vulnerability-scan.delete')}
                    </ActionButton>
                  </div>
                </td>
              </TableRow>
            ))}
            {!sortedReports.length && (
              <tr>
                <td
                  colSpan={11}
                  className="text-content-muted px-6 py-8 text-center text-sm"
                >
                  {t('oscrat.ui.no-vulnerability-scans-added')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrapper>

      {/* Pagination Controls */}
      {sortedReports.length > pageSize && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          showItemCount
          totalItems={sortedReports.length}
          itemsPerPage={pageSize}
        />
      )}
    </div>
  );
};

export default Table;
