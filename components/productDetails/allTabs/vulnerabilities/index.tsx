import IncidentStatusBar from '@/components/productDetails/allTabs/incidents/filterAndAdd';
import IncidentReport from '@/components/productDetails/allTabs/incidents/incidentReport';

const defaultStages = [
  { id: 'start', label: 'Preparation' },
  { id: 'declared', label: 'Receipt' },
  { id: 'stable', label: 'Verification' },
  { id: 'active', label: 'Remediation Development' },
  { id: 'resolved', label: 'Release' },
  { id: 'completed', label: 'Post-Release' },
];

export default function VulnerabilitiesTab() {
  return (
    <div className="w-full p-4 pl-0 pt-0 font-sans">
      <IncidentStatusBar
        stages={defaultStages}
        addButtonText="Add Vulnerability"
      />
      <IncidentReport />
    </div>
  );
}
