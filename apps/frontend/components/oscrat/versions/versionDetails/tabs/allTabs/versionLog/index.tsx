import React, { useState } from 'react';
import Table from './table';

// --- TYPE DEFINITIONS ---
interface EventData {
  id: string;
  dateAdded: string;
  type: string;
}

// TODO: Wait for BE implementation
export default function Index() {
  const initialEventData: EventData[] = [
    { id: '1', dateAdded: '02.05.2025', type: 'New Incident Reported' },
    { id: '2', dateAdded: '23.04.2025', type: 'New Vulnerability Reported' },
    { id: '3', dateAdded: '12.04.2025', type: 'External Reporting Added' },
    { id: '4', dateAdded: '06.04.2025', type: 'New Vulnerability Reported' },
    { id: '5', dateAdded: '18.03.2025', type: 'Vulnerability Closed' },
    { id: '6', dateAdded: '12.03.2025', type: 'New Vulnerability Reported' },
    { id: '7', dateAdded: '04.02.2025', type: 'New Incident Reported' },
    { id: '8', dateAdded: '01.01.2025', type: 'Version Created' },
  ];

  const [events, setEvents] = useState<EventData[]>(initialEventData);

  const handlePreview = (id: string) => {
    alert(`Preview for item ${id} is not yet implemented.`);
  };

  return (
    <div className="flex w-full flex-col items-center">
      <Table events={events} onPreview={handlePreview} />
    </div>
  );
}
