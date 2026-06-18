import React, { useState } from 'react';
import { FaRegEye } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import Button from '@/components/button';

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
      <div className="border-line bg-surface rounded-card w-full border p-4">
        <div className="overflow-x-auto">
          <table className="text-content w-full text-left text-sm">
            <thead className="bg-surface-muted text-content border-b border-line-header">
              <tr>
                {tableHeaders.map((header, index) => (
                  <th
                    key={header}
                    scope="col"
                    className={`p-4 text-b2 font-medium ${
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
                  className="bg-surface hover:bg-surface-muted border-t"
                >
                  <td className="text-content w-48 whitespace-nowrap px-4 py-4 pl-8 font-medium">
                    {event.dateAdded}
                  </td>
                  <td className="px-4 py-4">{event.type}</td>
                  <td className="w-24 px-4 py-4 pr-8 text-right">
                    <Button
                      variant="tertiary"
                      size="m"
                      onClick={() => handlePreview(event.id)}
                      startIcon={<FaRegEye />}
                    >
                      {t('preview')}
                    </Button>
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
