import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRecentActivities } from '@/lib/api/hooks/auditLogs';
import { useTeamContext } from '@/context/TeamContext';
import { getAuditActionTranslationKey } from '@/utils/translation';
import { formatDateShort } from '@/utils/dateFormat';

export default function RecentActivities() {
  const { t, ready } = useTranslation('common');
  const { slug } = useTeamContext();

  const { data, isLoading } = useRecentActivities(slug);

  const logs = data?.data ?? [];

  const tableHeaders = [
    t('date'),
    t('product'),
    t('version'),
    t('user'),
    t('action'),
  ];

  if (!ready) return null;

  return (
    <div className="w-full">
      <div className="border-line bg-surface rounded-card w-full border">
        {/* Header Section */}
        <div className="flex items-center justify-between p-6">
          <h1 className="text-content text-h6 font-bold">
            {t('recent-activities')}
          </h1>
        </div>

        {/* Activities Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-content-muted">{t('loading')}</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-content-muted">
                {t('no-recent-activities')}
              </div>
            </div>
          ) : (
            <table className="text-content-secondary w-full text-left text-sm">
              <thead className="bg-surface-muted text-content border-line-header border-b">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="text-b2 p-4 font-medium"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="bg-surface hover:bg-surface-muted border-b last:border-b-0"
                  >
                    <td className="text-content px-4 py-4 font-medium">
                      {formatDateShort(log.createdAt)}
                    </td>
                    <td className="px-4 py-4">{log.productName ?? '—'}</td>
                    <td className="px-4 py-4">{log.versionName ?? '—'}</td>
                    <td className="px-4 py-4">{log.userName ?? log.userId}</td>
                    <td className="px-4 py-4 text-sm">
                      {t(getAuditActionTranslationKey(log.action), {
                        defaultValue: log.action,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
