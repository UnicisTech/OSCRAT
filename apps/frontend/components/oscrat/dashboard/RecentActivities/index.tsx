import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRecentActivities } from '@/lib/api/hooks/auditLogs';
import { useTeamContext } from '@/context/TeamContext';
import { getAuditActionTranslationKey } from '@/utils/translation';

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
      <div className="w-full rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header Section */}
        <div className="flex items-center justify-between p-6">
          <h1 className="text-lg font-bold text-gray-800">
            {t('recent-activities')}
          </h1>
        </div>

        {/* Activities Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">{t('loading')}</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">{t('no-recent-activities')}</div>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="border-b bg-gray-50 text-xs font-semibold text-gray-900">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 font-medium"
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
                      className="border-b bg-white last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">{log.productName ?? '—'}</td>
                      <td className="px-6 py-4">{log.versionName ?? '—'}</td>
                      <td className="px-6 py-4">{log.userName ?? log.userId}</td>
                      <td className="px-6 py-4 text-sm">
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
