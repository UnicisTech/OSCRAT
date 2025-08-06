import React from 'react';
import { FaRegEye } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

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
    <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-200 text-xs text-gray-700">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 first:pl-8 last:pr-8"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t bg-white hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-gray-800 first:pl-8">
                  {event.dateAdded}
                </td>
                <td className="px-6 py-4">{event.type}</td>
                <td className="px-6 py-4 text-right last:pr-8">
                  <button
                    onClick={() => onPreview(event.id)}
                    className="flex items-center text-xs font-medium text-gray-900 hover:text-blue-600"
                  >
                    <FaRegEye className="mr-2" />
                    {t('preview')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
