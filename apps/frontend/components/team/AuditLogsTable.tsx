import React, { useState } from 'react';
import Table from '@/components/shared/Table';
import { useTranslation } from 'next-i18next';
import type { OscratAuditLog } from '@oscrat/model';
import AuditDetailsModal from './AuditDetailsModal';
import { getAuditActionTranslationKey } from '@/utils/translation';
import { getCrudConfig, formatTimestamp } from '@/lib/auditUtils';

interface AuditLogsTableProps {
  logs: OscratAuditLog[];
  isLoading?: boolean;
}

const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ logs, isLoading }) => {
  const { t } = useTranslation('common');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">{t('no-audit-logs')}</div>
      </div>
    );
  }

  return (
    <>
      <Table
        head={
          <>
            <Table.th>{t('timestamp')}</Table.th>
            <Table.th>{t('user')}</Table.th>
            <Table.th>{t('action')}</Table.th>
            <Table.th>{t('target')}</Table.th>
            <Table.th>{t('details')}</Table.th>
          </>
        }
        body={logs.map((log) => (
          <Table.tr key={log.id}>
            <Table.td>
              <span className="text-sm text-gray-600">
                {formatTimestamp(log.createdAt)}
              </span>
            </Table.td>
            <Table.td>
              <div className="flex flex-col">
                <span className="font-medium">
                  {log.userName || log.userId}
                </span>
                {log.userEmail && (
                  <span className="text-xs text-gray-500">{log.userEmail}</span>
                )}
              </div>
            </Table.td>
            <Table.td>
              <div className="flex items-center gap-2">
                {(() => {
                  const crud = getCrudConfig(log.crud);
                  return (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${crud.bg} ${crud.text}`}
                    >
                      {crud.label}
                    </span>
                  );
                })()}
                <span className="text-sm">{t(getAuditActionTranslationKey(log.action), { defaultValue: log.action })}</span>
              </div>
            </Table.td>
            <Table.td>
              <div className="flex flex-col">
                <span className="font-medium">{log.targetType}</span>
                {log.targetName && (
                  <span className="text-xs text-gray-500">{log.targetName}</span>
                )}
              </div>
            </Table.td>
            <Table.td>
              {log.metadata && (
                <button
                  onClick={() => handleViewDetails(log)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {t('view-details')}
                </button>
              )}
            </Table.td>
          </Table.tr>
        ))}
      />

      <AuditDetailsModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default AuditLogsTable;
