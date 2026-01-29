import React from 'react';
import { useTranslation } from 'next-i18next';
import { TabHeader, TableWrapper, TableHeader, TableRow } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatTimestamp } from '@/lib/auditUtils';
import { getAuditActionTranslationKey } from '@/utils/translation';
import type { OscratAuditLog } from '@oscrat/model';

const ITEMS_PER_PAGE = 15;

interface VersionLogTableProps {
  logs: OscratAuditLog[];
}

const Table: React.FC<VersionLogTableProps> = ({ logs }) => {
  const { t, ready } = useTranslation('common');
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<OscratAuditLog>(logs || [], ITEMS_PER_PAGE);

  const tableHeaders = [
    t('timestamp'),
    t('user'),
    t('action'),
    t('target'),
  ];

  if (!ready) return null;

  return (
    <div className="w-full">
      <TabHeader title={t('oscrat.ui.version-log')} />

      <TableWrapper>
        <table className={tableStyles.table}>
          <TableHeader
            columns={tableHeaders.map((header) => ({ label: header }))}
          />
          <tbody className={tableStyles.tbody}>
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                  {t('oscrat.ui.no-version-logs')}
                </td>
              </tr>
            )}
            {pageData.map((log) => (
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
                      <span className="font-medium">{log.targetType}</span>
                      {log.targetName && (
                        <span className="text-xs text-gray-500">{log.targetName}</span>
                      )}
                    </div>
                  </td>
                </TableRow>
            ))}
          </tbody>
        </table>
      </TableWrapper>

      {logs && logs.length > ITEMS_PER_PAGE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          showItemCount
          totalItems={logs.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}
    </div>
  );
};

export default Table;
