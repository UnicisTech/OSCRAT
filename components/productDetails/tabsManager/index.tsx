import { useState } from 'react';
import IncidentsTab from '../allTabs/incidents';
import ProductLogTab from '../allTabs/productLog';
import FilesTab from '../allTabs/files';
import SBOMTab from '../allTabs/sbom';
import VulnerabilitiesTab from '../allTabs/vulnerabilities';

const TABS_CONFIG = [
  { id: 'incidents', label: 'Incidents', component: <IncidentsTab /> },
  {
    id: 'vulnerabilities',
    label: 'Vulnerabilities',
    component: <VulnerabilitiesTab />,
  },
  { id: 'sbom', label: 'SBOM', component: <SBOMTab /> },
  { id: 'files', label: 'Files', component: <FilesTab /> },
  { id: 'product-log', label: 'Product Log', component: <ProductLogTab /> },
];

export default function TabsManager() {
  const [activeTab, setActiveTab] = useState(TABS_CONFIG[0].id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="mt-6">
      <div
        className="tab-buttons"
        role="tablist"
        aria-label="Information sections"
      >
        {TABS_CONFIG.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-button-${tab.id}`}
            onClick={() => handleTabChange(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'active-tab-button border-b-2 border-blue-500 font-medium text-blue-500'
                : 'inactive-tab-button'
            } mr-1 cursor-pointer px-4 py-2`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS_CONFIG.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-button-${tab.id}`}
          className={`tab-content-panel mt-4 rounded-lg border border-gray-500 p-3 ${activeTab === tab.id ? 'block' : 'hidden'}`}
        >
          {activeTab === tab.id && tab.component}
        </div>
      ))}
    </div>
  );
}
