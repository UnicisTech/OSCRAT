import React, { useMemo } from 'react';
import { FaDownload, FaTrash, FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { SbomReportDetails } from '@oscrat/model/operations';
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

interface SsmTableProps {
  reports?: SbomReportDetails[];
  onDownload: (id: string, filename: string) => void;
  onDelete: (reportId: string) => void;
  onScan: (reportId: string) => void;
  itemsPerPage?: number;
}

const Table: React.FC<SsmTableProps> = ({
  reports,
  onDownload,
  onDelete,
  onScan,
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
  } = usePagination<SbomReportDetails>(sortedReports, pageSize);

  if (!ready) {
    return null;
  }

  const formatDuration = (start: Date, end: Date) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusBadge = (report: SbomReportDetails) => {
    const statusConfig = {
      [WorkerJobStatus.COMPLETED]: {
        color: 'text-success',
        label: t('oscrat.ui.versions.sbom.completed'),
      },
      [WorkerJobStatus.IN_PROGRESS]: {
        color: 'text-primary',
        label: t('oscrat.ui.versions.sbom.in-progress'),
      },
      [WorkerJobStatus.FAILED]: {
        color: 'text-danger',
        label: t('oscrat.ui.versions.sbom.failed'),
      },
      [WorkerJobStatus.PENDING]: {
        color: 'text-content-secondary',
        label: t('oscrat.ui.versions.sbom.pending'),
      },
      [WorkerJobStatus.CANCELLED]: {
        color: 'text-content-secondary',
        label: t('oscrat.ui.versions.sbom.cancelled'),
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

  const getVulnStatusBadge = (status: WorkerJobStatus) => {
    const statusConfig = {
      [WorkerJobStatus.COMPLETED]: {
        color: 'bg-success-subtle text-success-emphasis',
        label: t('oscrat.ui.versions.sbom.completed'),
      },
      [WorkerJobStatus.IN_PROGRESS]: {
        color: 'bg-info-subtle text-info-emphasis',
        label: t('oscrat.ui.versions.sbom.in-progress'),
      },
      [WorkerJobStatus.FAILED]: {
        color: 'bg-danger-subtle text-danger-emphasis',
        label: t('oscrat.ui.versions.sbom.failed'),
      },
      [WorkerJobStatus.PENDING]: {
        color: 'bg-surface-muted text-content',
        label: t('oscrat.ui.versions.sbom.pending'),
      },
      [WorkerJobStatus.CANCELLED]: {
        color: 'bg-surface-muted text-content',
        label: t('oscrat.ui.versions.sbom.cancelled'),
      },
    };

    const config = statusConfig[status] || {
      color: 'bg-surface-muted text-content',
      label: t('oscrat.ui.unknown'),
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (!sortedReports.length) {
    return (
      <div className="text-content-muted flex flex-col items-center justify-center py-12">
        <p className="text-sm">{t('oscrat.ui.no-sbom-added')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-card w-full">
      <TableWrapper>
        <table className={tableStyles.tableAuto}>
          <TableHeader
            columns={[
              { label: t('status') },
              { label: t('oscrat.ui.source'), className: 'text-center' },
              {
                label: t('oscrat.ui.versions.sbom.started'),
                className: 'text-center',
              },
              {
                label: t('oscrat.ui.versions.sbom.triggered-by'),
                className: 'text-center',
              },
              {
                label: t('oscrat.ui.versions.sbom.duration'),
                className: 'text-center',
              },
              {
                label: t('oscrat.ui.versions.sbom.packages'),
                className: 'text-center',
              },
              { label: t('oscrat.ui.scan'), className: 'text-center' },
              { label: t('actions'), className: 'text-center' },
            ]}
          />
          <tbody className={tableStyles.tbody}>
            {pageData.map((report) => (
              <TableRow
                key={report.id}
                className="cursor-pointer"
                onClick={() =>
                  router.push(
                    `/organization/${slug}/products/${productId}/versions/${versionId}/sbom/${report.id}`
                  )
                }
              >
                <td className={tableStyles.td}>{getStatusBadge(report)}</td>
                <td className={tableStyles.tdCenter}>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      report.job.source === 'REPO'
                        ? 'bg-info-subtle text-info-emphasis'
                        : 'bg-success-subtle text-success-emphasis'
                    }`}
                  >
                    {report.job.source === 'REPO'
                      ? t('oscrat.ui.repository.labels.title')
                      : t('oscrat.ui.versions.sbom.file-import')}
                  </span>
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
                  {report.sbomData?.overview?.totalComponents || '-'}
                </td>
                <td className={tableStyles.tdCenter}>
                  {report.latestVulnerabilityScan ? (
                    report.latestVulnerabilityScan.status ===
                    WorkerJobStatus.COMPLETED ? (
                      <ShortUuidButton
                        uuid={report.latestVulnerabilityScan.id}
                        href={`/organization/${slug}/products/${productId}/versions/${versionId}/scan/${report.latestVulnerabilityScan.id}`}
                      />
                    ) : (
                      getVulnStatusBadge(report.latestVulnerabilityScan.status)
                    )
                  ) : (
                    <span className="text-content-placeholder">
                      {t('oscrat.ui.none')}
                    </span>
                  )}
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
                      title={t('oscrat.ui.versions.sbom.download-sbom')}
                    >
                      {t('oscrat.ui.versions.sbom.download')}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onScan(report.id)}
                      disabled={
                        report.status !== WorkerJobStatus.COMPLETED ||
                        report.latestVulnerabilityScan?.status ===
                          WorkerJobStatus.PENDING ||
                        report.latestVulnerabilityScan?.status ===
                          WorkerJobStatus.IN_PROGRESS
                      }
                      icon={<FaShieldAlt size={12} />}
                      title={t('oscrat.ui.versions.sbom.scan-vulnerabilities')}
                    >
                      {t('oscrat.ui.scan')}
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
                          ? t('oscrat.ui.versions.sbom.delete-job')
                          : t(
                              'oscrat.ui.versions.sbom.delete-only-completed-failed'
                            )
                      }
                    >
                      {t('oscrat.ui.versions.sbom.delete')}
                    </ActionButton>
                  </div>
                </td>
              </TableRow>
            ))}
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
        />
      )}
    </div>
  );
};

export default Table;
