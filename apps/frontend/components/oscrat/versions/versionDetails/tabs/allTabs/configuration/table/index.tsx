import React from 'react';
import { FaDownload, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { ConfigurationScanReportDetails } from '@oscrat/model/operations';
import { ConfigurationScanFormat, WorkerJobStatus } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import { getErrorCodeTranslationKey } from '@/utils/errorCodeTranslation';
import ActionButton from '@/components/oscrat/ActionButton';
import { tableStyles } from '@/components/oscrat/tableStyles';
import PaginationControls from '@/components/shared/PaginationControls';
import {
  TableWrapper,
  TableHeader,
  TableRow,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';

const ITEMS_PER_PAGE = 10;

interface ConfigurationTableProps {
  reports?: ConfigurationScanReportDetails[];
  onDownload: (id: string, filename: string) => void;
  onDelete: (reportId: string) => void;
  itemsPerPage?: number;
}

const formatNumeric = (value: number | undefined) =>
  typeof value === 'number' ? value : '-';

const FORMAT_BADGE_CLASS: Record<ConfigurationScanFormat, string> = {
  [ConfigurationScanFormat.ARF]: 'bg-purple-100 text-purple-800',
  [ConfigurationScanFormat.XCCDF]: 'bg-indigo-100 text-indigo-800',
  [ConfigurationScanFormat.OVAL]: 'bg-teal-100 text-teal-800',
};

const Table: React.FC<ConfigurationTableProps> = ({
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
  } = usePagination<ConfigurationScanReportDetails>(reports || [], pageSize);

  if (!ready) {
    return null;
  }

  const formatDuration = (start: Date, end: Date) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusBadge = (report: ConfigurationScanReportDetails) => {
    const statusConfig = {
      [WorkerJobStatus.COMPLETED]: {
        color: 'text-green-600',
        label: t('oscrat.ui.versions.configuration.completed'),
      },
      [WorkerJobStatus.IN_PROGRESS]: {
        color: 'text-blue-600',
        label: t('oscrat.ui.versions.configuration.in-progress'),
      },
      [WorkerJobStatus.FAILED]: {
        color: 'text-red-600',
        label: t('oscrat.ui.versions.configuration.failed'),
      },
      [WorkerJobStatus.PENDING]: {
        color: 'text-gray-600',
        label: t('oscrat.ui.versions.configuration.pending'),
      },
      [WorkerJobStatus.CANCELLED]: {
        color: 'text-gray-600',
        label: t('oscrat.ui.versions.configuration.cancelled'),
      },
    };

    const config = statusConfig[report.status] || {
      color: 'text-gray-600',
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

  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-sm">{t('oscrat.ui.no-config-scan-added')}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg">
      <TableWrapper>
        <table className={tableStyles.table}>
          <TableHeader
            columns={[
              { label: t('status'), className: 'w-28' },
              {
                label: t('oscrat.ui.versions.configuration.format'),
                className: 'w-24 text-center',
              },
              {
                label: t('oscrat.ui.versions.configuration.started'),
                className: 'w-28 text-center',
              },
              {
                label: t('oscrat.ui.versions.configuration.triggered-by'),
                className: 'w-24 text-center',
              },
              {
                label: t('oscrat.ui.versions.configuration.duration'),
                className: 'w-16 text-center',
              },
              {
                label: t('oscrat.ui.versions.configuration.total-rules'),
                className: 'w-16 text-center',
              },
              {
                label: t('oscrat.ui.versions.configuration.pass-count'),
                className: 'w-16 text-center',
              },
              {
                label: t('oscrat.ui.versions.configuration.fail-count'),
                className: 'w-16 text-center',
              },
              { label: t('actions'), className: 'w-40 text-center' },
            ]}
          />
          <tbody className={tableStyles.tbody}>
            {pageData.map((report) => {
              const summary = report.scanData;
              return (
                <TableRow
                  key={report.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/organization/${slug}/products/${productId}/versions/${versionId}/configuration/${report.id}`
                    )
                  }
                >
                  <td className={tableStyles.td}>{getStatusBadge(report)}</td>
                  <td className={tableStyles.tdCenter}>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${FORMAT_BADGE_CLASS[report.format]}`}
                    >
                      {report.format} {report.formatVersion}
                    </span>
                  </td>
                  <td className={tableStyles.tdCenter}>
                    {new Date(report.job.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
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
                    {formatNumeric(summary?.totalRules)}
                  </td>
                  <td className={tableStyles.tdCenter}>
                    {formatNumeric(summary?.passCount)}
                  </td>
                  <td className={tableStyles.tdCenter}>
                    {formatNumeric(summary?.failCount)}
                  </td>
                  <td className="px-6 py-4 text-center align-middle">
                    <div
                      className="flex items-center justify-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionButton
                        onClick={() =>
                          report.attachment &&
                          onDownload(
                            report.attachment.id,
                            report.attachment.name
                          )
                        }
                        disabled={
                          report.status !== WorkerJobStatus.COMPLETED ||
                          !report.attachment
                        }
                        icon={<FaDownload size={12} />}
                        title={t(
                          'oscrat.ui.versions.configuration.download-report'
                        )}
                      >
                        {t('oscrat.ui.versions.configuration.download')}
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
                            ? t('oscrat.ui.versions.configuration.delete-job')
                            : t(
                                'oscrat.ui.versions.configuration.delete-only-completed-failed'
                              )
                        }
                      >
                        {t('oscrat.ui.versions.configuration.delete')}
                      </ActionButton>
                    </div>
                  </td>
                </TableRow>
              );
            })}
          </tbody>
        </table>
      </TableWrapper>

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
