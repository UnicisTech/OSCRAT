import React, { useState } from 'react';
import Table from '@/components/shared/Table';
import Button from '@/components/button';
import { useTranslation } from 'next-i18next';
import type { OscratAuditLog } from '@oscrat/model';
import AuditDetailsModal from './AuditDetailsModal';
import {
  getAuditActionTranslationKey,
  oscratEntityTypeTranslationMap,
} from '@/utils/translation';
import { getCrudConfig, formatTimestamp } from '@/lib/auditUtils';
import { formatNameWithUuidFallback } from '@/lib/utils';

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
        <div className="text-content-muted">{t('loading')}</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-content-muted">{t('no-audit-logs')}</div>
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
              <span className="text-content-secondary text-sm">
                {formatTimestamp(log.createdAt)}
              </span>
            </Table.td>
            <Table.td>
              <div className="flex flex-col">
                <span className="font-medium">
                  {log.userName || log.userId}
                </span>
                {log.userEmail && (
                  <span className="text-content-muted text-xs">
                    {log.userEmail}
                  </span>
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
                      {t(crud.labelKey, {
                        defaultValue: log.crud.toUpperCase(),
                      })}
                    </span>
                  );
                })()}
                <span className="text-sm">
                  {t(getAuditActionTranslationKey(log.action), {
                    defaultValue: log.action,
                  })}
                </span>
              </div>
            </Table.td>
            <Table.td>
              <div className="flex flex-col">
                <span className="font-medium">
                  {t(oscratEntityTypeTranslationMap[log.targetType], {
                    defaultValue: log.targetType,
                  })}
                </span>
                {log.targetName && (
                  <span className="text-content-muted text-xs">
                    {formatNameWithUuidFallback(log.targetName, t)}
                  </span>
                )}
              </div>
            </Table.td>
            <Table.td>
              {log.metadata && (
                <Button
                  variant="tertiary"
                  size="m"
                  onClick={() => handleViewDetails(log)}
                  text={t('view-details')}
                />
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
