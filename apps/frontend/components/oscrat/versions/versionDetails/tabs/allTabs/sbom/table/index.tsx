import React from 'react';
import {
  FaDownload,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import type { SbomWorkerJob } from '@oscrat/model';
import { WorkerJobStatus } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import { getErrorCodeTranslationKey } from '@/utils/errorCodeTranslation';

const ITEMS_PER_PAGE = 5; // For testing, can be changed to 15 later

interface SsmTableProps {
  jobs?: SbomWorkerJob[];
  onDownload: (id: string, filename: string) => void;
  onDelete: (jobId: string) => void;
  isLoading?: boolean;
  itemsPerPage?: number;
}

interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  children,
  title,
}) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium ${
        disabled
          ? 'cursor-not-allowed text-gray-400 opacity-50'
          : 'cursor-pointer text-gray-700 hover:bg-gray-50'
      }`}
      title={title}
    >
      <span className="mr-1.5">{icon}</span>
      {children}
    </button>
  );
};

const tableStyles = {
  wrapper: 'overflow-x-auto rounded-lg shadow-sm border border-gray-200',
  table: 'w-full table-fixed text-left text-sm text-gray-600',
  thead: 'bg-gray-50 border-b border-gray-200',
  th: 'px-6 py-3.5 text-xs font-medium text-gray-700 uppercase tracking-wider',
  tbody: 'divide-y divide-gray-200 bg-white',
  tr: 'hover:bg-gray-50',
  td: 'px-6 py-4 truncate align-middle',
  tdSmall: 'px-6 py-4 text-xs truncate align-middle',
  tdCenter: 'px-6 py-4 text-xs truncate align-middle text-center',
  sectionTitle: 'mb-3 text-sm font-medium text-gray-900',
};

const Table: React.FC<SsmTableProps> = ({
  jobs,
  onDownload,
  onDelete,
  itemsPerPage,
}) => {
  const { t, ready } = useTranslation('common');

  const pageSize = itemsPerPage || ITEMS_PER_PAGE;
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<SbomWorkerJob>(jobs || [], pageSize);

  if (!ready) {
    return null;
  }

  const formatDuration = (start: Date, end: Date) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusBadge = (job: SbomWorkerJob) => {
    const statusConfig = {
      [WorkerJobStatus.COMPLETED]: {
        color: 'text-green-600',
        label: t('oscrat.ui.versions.sbom.completed'),
      },
      [WorkerJobStatus.IN_PROGRESS]: {
        color: 'text-blue-600',
        label: t('oscrat.ui.versions.sbom.in-progress'),
      },
      [WorkerJobStatus.FAILED]: {
        color: 'text-red-600',
        label: t('oscrat.ui.versions.sbom.failed'),
      },
      [WorkerJobStatus.PENDING]: {
        color: 'text-gray-600',
        label: t('oscrat.ui.versions.sbom.pending'),
      },
      [WorkerJobStatus.CANCELLED]: {
        color: 'text-gray-600',
        label: t('oscrat.ui.versions.sbom.cancelled'),
      },
    };

    const config = statusConfig[job.status] || {
      color: 'text-gray-600',
      label: t('oscrat.ui.unknown'),
    };

    return (
      <span
        className={`flex items-center ${config.color}`}
        title={job.status === WorkerJobStatus.FAILED && job.errCode
          ? `Error ${job.errCode}: ${t(getErrorCodeTranslationKey(job.errCode))}`
          : undefined}
      >
        <span className="mr-1">●</span>
        {config.label}
      </span>
    );
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-sm">{t('oscrat.ui.no-sbom-added')}</p>
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
                {t('oscrat.ui.versions.sbom.started')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-24 text-center`}>
                {t('oscrat.ui.versions.sbom.triggered-by')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-16 text-center`}>
                {t('oscrat.ui.versions.sbom.duration')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-16 text-center`}>
                {t('oscrat.ui.versions.sbom.packages')}
              </th>
              <th scope="col" className={`${tableStyles.th} w-40 text-center`}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {pageData.map((job) => (
              <tr key={job.id} className={tableStyles.tr}>
                <td className={tableStyles.td}>{getStatusBadge(job)}</td>
                <td className={tableStyles.tdCenter}>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      job.source === 'REPO'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {job.source === 'REPO'
                      ? t('oscrat.ui.repository.labels.title')
                      : t('oscrat.ui.versions.sbom.file-import')}
                  </span>
                </td>
                <td className={tableStyles.tdCenter}>
                  {new Date(job.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td
                  className={tableStyles.tdCenter}
                  title={
                    job.triggeredByUser?.name ||
                    job.triggeredByUser?.email ||
                    '-'
                  }
                >
                  {job.triggeredByUser?.name ||
                    job.triggeredByUser?.email ||
                    '-'}
                </td>
                <td className={tableStyles.tdCenter}>
                  {job.status === WorkerJobStatus.COMPLETED &&
                  job.processStartTime &&
                  job.processEndTime
                    ? formatDuration(job.processStartTime, job.processEndTime)
                    : '-'}
                </td>
                <td className={tableStyles.tdCenter}>
                  {job.sbomData?.overview?.totalComponents || '-'}
                </td>
                <td className="px-6 py-4 text-center align-middle">
                  <div className="flex items-center justify-center space-x-2">
                    <ActionButton
                      onClick={() =>
                        job.attachment &&
                        onDownload(job.attachment.id, job.attachment.name)
                      }
                      disabled={
                        job.status !== WorkerJobStatus.COMPLETED ||
                        !job.attachment
                      }
                      icon={<FaDownload size={14} />}
                      title={t('oscrat.ui.versions.sbom.download-sbom')}
                    >
                      {t('oscrat.ui.versions.sbom.download')}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onDelete(job.id)}
                      disabled={
                        job.status !== WorkerJobStatus.COMPLETED &&
                        job.status !== WorkerJobStatus.FAILED
                      }
                      icon={<FaTrash size={14} />}
                      title={
                        job.status === WorkerJobStatus.COMPLETED ||
                        job.status === WorkerJobStatus.FAILED
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
              </tr>
            ))}
            {(!jobs || jobs.length === 0) && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {t('oscrat.ui.no-sbom-added')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {jobs && jobs.length > pageSize && (
        <div className="mt-4 flex justify-center">
          <div className="inline-flex">
            <button
              onClick={goToPreviousPage}
              disabled={prevButtonDisabled}
              title={t('previous-page')}
              className={`rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                prevButtonDisabled
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaChevronLeft />
            </button>
            <span className="border-b border-t border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={nextButtonDisabled}
              title={t('next-page')}
              className={`rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                nextButtonDisabled
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
