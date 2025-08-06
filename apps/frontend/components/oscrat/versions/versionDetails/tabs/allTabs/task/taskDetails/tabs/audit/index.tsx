import React, { useState } from 'react';
import { FaRegEye } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

// --- TYPE DEFINITIONS ---

interface EventLogData {
  id: string;
  dateAdded: string;
  type: string;
}

// --- MAIN APP COMPONENT ---

export default function App() {
  const { t, ready } = useTranslation('common');

  // --- MOCK DATA ---
  const mockEventLog: EventLogData[] = [
    {
      id: 'evt-1',
      dateAdded: '02.05.2025',
      type: 'Name Changed to "MVSP - 1.1"',
    },
    {
      id: 'evt-2',
      dateAdded: '23.04.2025',
      type: 'Assignee added - Anna Mayer',
    },
    { id: 'evt-3', dateAdded: '12.04.2025', type: 'Task Created' },
  ];

  const [eventLog, setEventLog] = useState<EventLogData[]>(mockEventLog);

  if (!ready) return null;

  // --- HANDLERS ---
  const handlePreview = (id: string) => {
    alert(
      `Preview for event log ID: ${id}. Functionality not yet implemented.`
    );
  };

  const tableHeaders = ['Dated Added', 'Type', ''];

  return (
    <div className="flex w-full justify-center">
      <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-900">
            <thead className="bg-gray-200 text-xs text-gray-900">
              <tr>
                {tableHeaders.map((header, index) => (
                  <th
                    key={header}
                    scope="col"
                    className={`px-6 py-3 ${
                      index === 0
                        ? 'w-32 pl-8'
                        : index === 1
                          ? 'w-auto'
                          : index === tableHeaders.length - 1
                            ? 'w-24 pr-8 text-right'
                            : ''
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eventLog.map((event) => (
                <tr
                  key={event.id}
                  className="border-t bg-white hover:bg-gray-50"
                >
                  <td className="w-48 whitespace-nowrap px-6 py-4 pl-8 font-medium text-gray-900">
                    {event.dateAdded}
                  </td>
                  <td className="px-6 py-4">{event.type}</td>
                  <td className="w-24 px-6 py-4 pr-8 text-right">
                    <button
                      onClick={() => handlePreview(event.id)}
                      className="flex items-center justify-end text-xs font-medium text-gray-900"
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
    </div>
  );
}
