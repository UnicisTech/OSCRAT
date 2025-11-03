import React from 'react';
import {
  FaDownload,
  FaTrash,
} from 'react-icons/fa';
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

const ITEMS_PER_PAGE = 15;

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

  const pageSize = itemsPerPage || ITEMS_PER_PAGE;
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<VulnerabilityScanReportDetails>(reports || [], pageSize);

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
        color: 'text-green-600',
        label: t('oscrat.ui.versions.vulnerability-scan.completed'),
      },
      [WorkerJobStatus.IN_PROGRESS]: {
        color: 'text-blue-600',
        label: t('oscrat.ui.versions.vulnerability-scan.in-progress'),
      },
      [WorkerJobStatus.FAILED]: {
        color: 'text-red-600',
        label: t('oscrat.ui.versions.vulnerability-scan.failed'),
      },
      [WorkerJobStatus.PENDING]: {
        color: 'text-gray-600',
        label: t('oscrat.ui.versions.vulnerability-scan.pending'),
      },
      [WorkerJobStatus.CANCELLED]: {
        color: 'text-gray-600',
        label: t('oscrat.ui.versions.vulnerability-scan.cancelled'),
      },
    };

    const config = statusConfig[report.status] || {
      color: 'text-gray-600',
      label: t('oscrat.ui.unknown'),
    };

    return (
      <span
        className={`flex items-center ${config.color}`}
        title={report.status === WorkerJobStatus.FAILED && report.job.errCode
          ? `Error ${report.job.errCode}: ${t(getErrorCodeTranslationKey(report.job.errCode))}`
          : undefined}
      >
        <span className="mr-1">●</span>
        {config.label}
      </span>
    );
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-sm">{t('oscrat.ui.no-vulnerability-scans-added')}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg">
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <thead className={tableStyles.thead}>
            <tr>
              <th scope="col" className={`${tableStyles.th} w-28`}>
                {t('status')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-20 text-center`}>
                {t('oscrat.ui.source')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-28 text-center`}>
                {t('oscrat.ui.versions.vulnerability-scan.started')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-24 text-center`}>
                {t('oscrat.ui.versions.vulnerability-scan.triggered-by')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-16 text-center`}>
                {t('oscrat.ui.versions.vulnerability-scan.duration')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-12 text-center`}>
                {t('oscrat.ui.versions.vulnerability-scan.total')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-12 text-center`}>
                {t('oscrat.ui.versions.vulnerability-scan.critical')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-12 text-center`}>
                {t('oscrat.ui.versions.vulnerability-scan.high')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-12 text-center`}>
                {t('oscrat.ui.versions.vulnerability-scan.medium')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-12 text-center`}>
                {t('oscrat.ui.versions.vulnerability-scan.low')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-40 text-center`}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {pageData.map((report) => (
              <tr
                key={report.id}
                className={`${tableStyles.tr} cursor-pointer`}
                onClick={() =>
                  router.push(
                    `/teams/${slug}/products/${productId}/versions/${versionId}/scan/${report.id}`
                  )
                }
              >
                <td className={tableStyles.td}>{getStatusBadge(report)}</td>
                <td className={tableStyles.tdCenter}>
                  {report.sourceSbomReport ? (
                    <ShortUuidButton
                      uuid={report.sourceSbomReport.id}
                      href={`/teams/${slug}/products/${productId}/versions/${versionId}/sbom/${report.sourceSbomReport.id}`}
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className={tableStyles.tdCenter}>
                  {new Date(report.job.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
                    ? formatDuration(report.job.processStartTime, report.job.processEndTime)
                    : '-'}
                </td>
                <td className={tableStyles.tdCenter}>
                  {report.scanData?.totalVulnerabilities ?? '-'}
                </td>
                <td className={tableStyles.tdCenter}>
                  <span className={report.scanData?.criticalCount ? 'text-red-600 font-semibold' : ''}>
                    {report.scanData?.criticalCount ?? '-'}
                  </span>
                </td>
                <td className={tableStyles.tdCenter}>
                  <span className={report.scanData?.highCount ? 'text-orange-600 font-semibold' : ''}>
                    {report.scanData?.highCount ?? '-'}
                  </span>
                </td>
                <td className={tableStyles.tdCenter}>
                  <span className={report.scanData?.mediumCount ? 'text-yellow-600' : ''}>
                    {report.scanData?.mediumCount ?? '-'}
                  </span>
                </td>
                <td className={tableStyles.tdCenter}>
                  <span className={report.scanData?.lowCount ? 'text-blue-600' : ''}>
                    {report.scanData?.lowCount ?? '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center align-middle">
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
                      title={t('oscrat.ui.versions.vulnerability-scan.download-report')}
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
                          ? t('oscrat.ui.versions.vulnerability-scan.delete-job')
                          : t(
                              'oscrat.ui.versions.vulnerability-scan.delete-only-completed-failed'
                            )
                      }
                    >
                      {t('oscrat.ui.versions.vulnerability-scan.delete')}
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {(!reports || reports.length === 0) && (
              <tr>
                <td
                  colSpan={11}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {t('oscrat.ui.no-vulnerability-scans-added')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {reports && reports.length > pageSize && (
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
