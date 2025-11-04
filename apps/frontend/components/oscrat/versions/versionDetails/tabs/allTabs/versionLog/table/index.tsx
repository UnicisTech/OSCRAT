import React from 'react';
import { FaRegEye } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { TabHeader, TableWrapper, TableHeader, TableRow } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';

// --- TYPE DEFINITIONS ---
interface EventData {
  id: string;
  dateAdded: string;
  type: string;
}

interface EventLogTableProps {
  events: EventData[];
  onPreview: (id: string) => void;
}

const Table: React.FC<EventLogTableProps> = ({ events, onPreview }) => {
  const tableHeaders = ['Dated Added', 'Type', ''];
  const { t, ready } = useTranslation('common');

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
            {(!events || events.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                  {t('oscrat.ui.no-version-logs')}
                </td>
              </tr>
            )}
            {events.map((event) => (
              <TableRow key={event.id}>
                <td className={tableStyles.td}>
                  {event.dateAdded}
                </td>
                <td className={tableStyles.td}>{event.type}</td>
                <td className={`${tableStyles.td} text-right`}>
                  <button
                    onClick={() => onPreview(event.id)}
                    className="flex items-center text-xs font-medium text-gray-900 hover:text-blue-600"
                  >
                    <FaRegEye className="mr-2" />
                    {t('preview')}
                  </button>
                </td>
              </TableRow>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
};

export default Table;
