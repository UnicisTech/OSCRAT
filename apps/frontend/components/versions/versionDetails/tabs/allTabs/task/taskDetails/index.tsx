import Details from './details';
import TabsManager from '@/components/shared/TabsManager';
import TABS_CONFIG from '@/components/versions/versionDetails/tabs/allTabs/task/taskDetails/tabs';
import React from 'react';

export default function TaskDetails() {
  // --- MOCK DATA ---
  const mockTaskDetails = {
    name: 'MVSP - 1.1',
    section: 'Incidents',
    assignee: 'Anna Meier',
    dateAdded: '01.01.2025',
    details: `On request, enable your customer or their delegates to test the security of your application
Test on a non-production environment if it resembles the production environment in functionality
Ensure non-production environment do not contain production data`,
    availableSections: ['Incidents', 'Vulnerabilities', 'SBOM', 'Compliance'],
    availableAssignees: [
      'Anna Meier',
      'Ravi Patel',
      'Emily Carter',
      'John Doe',
    ],
  };

  return (
    <div className="flex flex-col">
      <Details task={mockTaskDetails} />
      <TabsManager tabs={TABS_CONFIG} />
    </div>
  );
}
