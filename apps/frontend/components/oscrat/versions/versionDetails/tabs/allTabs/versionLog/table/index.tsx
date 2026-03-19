import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { TabHeader, TableWrapper, TableHeader, TableRow } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatTimestamp } from '@/lib/auditUtils';
import { formatNameWithUuidFallback } from '@/lib/utils';
import { getAuditActionTranslationKey, oscratEntityTypeTranslationMap } from '@/utils/translation';
import AuditLogsFilters from '@/components/team/AuditLogsFilters';
import AuditDetailsModal from '@/components/team/AuditDetailsModal';
import type { OscratAuditLog, OscratAuditLogQueryParams, AuditLogFilterOptions } from '@oscrat/model';

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
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  {t('oscrat.ui.no-version-logs')}
                </td>
              </tr>
            )}
            {logs.map((log) => (
                <TableRow key={log.id}>
                  <td className={tableStyles.td}>
                    <span className="text-sm text-gray-600">
                      {formatTimestamp(log.createdAt)}
                    </span>
                  </td>
                  <td className={tableStyles.td}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {log.userName || log.userId}
                      </span>
                      {log.userEmail && (
                        <span className="text-xs text-gray-500">{log.userEmail}</span>
                      )}
                    </div>
                  </td>
                  <td className={tableStyles.td}>
                    <span className="text-sm">
                      {t(getAuditActionTranslationKey(log.action), { defaultValue: log.action })}
                    </span>
                  </td>
                  <td className={tableStyles.td}>
                    <div className="flex flex-col">
                      <span className="font-medium">{t(oscratEntityTypeTranslationMap[log.targetType], { defaultValue: log.targetType })}</span>
                      {log.targetName && (
                        <span className="text-xs text-gray-500">
                          {formatNameWithUuidFallback(log.targetName, t)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={tableStyles.td}>
                    {log.metadata && (
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {t('view-details')}
                      </button>
                    )}
                  </td>
                </TableRow>
            ))}
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
          itemsPerPage={15}
        />
      )}

      <AuditDetailsModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Table;
