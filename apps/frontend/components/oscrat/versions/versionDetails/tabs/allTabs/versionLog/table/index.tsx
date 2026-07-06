import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  TabHeader,
  TableWrapper,
  TableHeader,
  TableRow,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';
import PaginationControls from '@/components/shared/PaginationControls';
import Button from '@/components/button';
import { formatTimestamp } from '@/lib/auditUtils';
import { formatNameWithUuidFallback } from '@/lib/utils';
import {
  getAuditActionTranslationKey,
  oscratEntityTypeTranslationMap,
} from '@/utils/translation';
import AuditLogsFilters from '@/components/team/AuditLogsFilters';
import AuditDetailsModal from '@/components/team/AuditDetailsModal';
import type {
  OscratAuditLog,
  OscratAuditLogQueryParams,
  AuditLogFilterOptions,
} from '@oscrat/model';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

interface VersionLogTableProps {
  logs: OscratAuditLog[];
  totalLogs: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: Partial<OscratAuditLogQueryParams>;
  onFilterChange: (filters: Partial<OscratAuditLogQueryParams>) => void;
  filterOptions?: AuditLogFilterOptions;
  isLoadingOptions?: boolean;
  teamSlug?: string;
}

const Table: React.FC<VersionLogTableProps> = ({
  logs,
  totalLogs,
  currentPage,
  totalPages,
  onPageChange,
  filters,
  onFilterChange,
  filterOptions,
  isLoadingOptions,
  teamSlug,
}) => {
  const { t, ready } = useTranslation('common');
  const [selectedLog, setSelectedLog] = useState<OscratAuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (log: OscratAuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const tableHeaders = [
    t('timestamp'),
    t('user'),
    t('action'),
    t('target'),
    t('details'),
  ];

  if (!ready) return null;

  return (
    <div className="w-full">
      <TabHeader title={t('oscrat.ui.version-log')}>
        <AuditLogsFilters
          filters={filters}
          onFilterChange={onFilterChange}
          filterOptions={filterOptions}
          isLoadingOptions={isLoadingOptions}
        />
      </TabHeader>

      <TableWrapper>
        <table className={tableStyles.table}>
          <TableHeader
            columns={tableHeaders.map((header) => ({ label: header }))}
          />
          <tbody className={tableStyles.tbody}>
            {(!logs || logs.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="text-content-muted px-6 py-8 text-center text-sm"
                >
                  {t('oscrat.ui.no-version-logs')}
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const userLabel = log.userName || log.userId;
              const actionLabel = t(getAuditActionTranslationKey(log.action), {
                defaultValue: log.action,
              });
              const targetTypeLabel = t(
                oscratEntityTypeTranslationMap[log.targetType],
                { defaultValue: log.targetType }
              );
              const targetNameLabel = log.targetName
                ? formatNameWithUuidFallback(log.targetName, t)
                : '';
              return (
              <TableRow key={log.id}>
                <td className={tableStyles.td}>
                  <span className="text-content-secondary text-sm">
                    {formatTimestamp(log.createdAt)}
                  </span>
                </td>
                <td className={tableStyles.td}>
                  <div className="flex min-w-0 flex-col">
                    <span
                      className="truncate font-medium"
                      title={userLabel}
                    >
                      {userLabel}
                    </span>
                    {log.userEmail && (
                      <span
                        className="text-content-muted truncate text-xs"
                        title={log.userEmail}
                      >
                        {log.userEmail}
                      </span>
                    )}
                  </div>
                </td>
                <td className={tableStyles.td} title={actionLabel}>
                  <span className="text-sm">{actionLabel}</span>
                </td>
                <td className={tableStyles.td}>
                  <div className="flex min-w-0 flex-col">
                    <span
                      className="truncate font-medium"
                      title={targetTypeLabel}
                    >
                      {targetTypeLabel}
                    </span>
                    {targetNameLabel && (
                      <span
                        className="text-content-muted truncate text-xs"
                        title={targetNameLabel}
                      >
                        {targetNameLabel}
                      </span>
                    )}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  {log.metadata && (
                    <Button
                      variant="tertiary"
                      size="m"
                      onClick={() => handleViewDetails(log)}
                      className="hover:underline"
                      text={t('view-details')}
                    />
                  )}
                </td>
              </TableRow>
              );
            })}
          </tbody>
        </table>
      </TableWrapper>

      {totalLogs > 0 && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={currentPage <= 1}
          nextButtonDisabled={currentPage >= totalPages}
          goToPreviousPage={() => onPageChange(currentPage - 1)}
          goToNextPage={() => onPageChange(currentPage + 1)}
          showItemCount
          totalItems={totalLogs}
          itemsPerPage={LISTING_PAGE_SIZE}
        />
      )}

      <AuditDetailsModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        teamSlug={teamSlug}
      />
    </div>
  );
};

export default Table;
