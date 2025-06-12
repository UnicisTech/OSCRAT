import React from 'react';
import { Eye } from 'lucide-react';

const initialEventLogs = [
  { id: 1, dateAdded: '02.05.2025', type: 'New Incident Reported' },
  { id: 2, dateAdded: '23.04.2025', type: 'New Vulnerability Reported' },
  { id: 3, dateAdded: '12.04.2025', type: 'External Reporting Added' },
  { id: 4, dateAdded: '06.04.2025', type: 'New Vulnerability Reported' },
  { id: 5, dateAdded: '18.03.2025', type: 'Vulnerability Closed' },
  { id: 6, dateAdded: '12.03.2025', type: 'New Vulnerability Reported' },
  { id: 7, dateAdded: '04.02.2025', type: 'New Incident Reported' },
  { id: 8, dateAdded: '01.01.2025', type: 'Product Created' },
];

const EventLogItem = ({ log }) => {
  const handlePreview = () => {
    console.log('Previewing log:', log);
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 transition-colors duration-150 hover:bg-gray-50">
      <div className="flex items-center space-x-4 sm:space-x-6">
        <span className="w-24 text-sm text-gray-700 sm:w-28">
          {log.dateAdded}
        </span>
        <span className="text-sm font-medium text-gray-800">{log.type}</span>
      </div>
      <button
        type="button"
        onClick={handlePreview}
        disabled
        className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-800 focus:underline focus:outline-none"
      >
        <Eye size={16} className="mr-1.5 text-gray-500" />
        Preview
      </button>
    </div>
  );
};

const EventLogList = () => {
  const [eventLogs] = React.useState(initialEventLogs);

  return (
    <div className="w-full overflow-hidden rounded-lg bg-white font-sans shadow-md">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <span className="w-24 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:w-28">
          Dated Added
        </span>
        <span className="flex-grow text-xs font-semibold uppercase tracking-wider text-gray-500">
          Type
        </span>
        <span className="invisible w-24 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
          Action
        </span>
      </div>

      {eventLogs.length > 0 ? (
        eventLogs.map((log) => <EventLogItem key={log.id} log={log} />)
      ) : (
        <div className="py-8 text-center text-gray-500">
          No events to display.
        </div>
      )}
    </div>
  );
};

export default EventLogList;
