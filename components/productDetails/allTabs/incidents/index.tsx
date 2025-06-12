import IncidentStatusBar from './filterAndAdd';
import IncidentReport from '@/components/productDetails/allTabs/incidents/incidentReport';

export default function IncidentsTab() {
  return (
    <>
      <IncidentStatusBar />
      <IncidentReport />
    </>
  );
}
