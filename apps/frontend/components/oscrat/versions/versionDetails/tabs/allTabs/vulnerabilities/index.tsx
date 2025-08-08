import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import {
  OscratProductVulnerabilityStatus,
  OscratVulnerabilitySummary,
} from '@oscrat/model';
import { useProductContext } from '@/context/ProductContext';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useVersionContext } from '@/context/VersionContext';
import { usePathname, useRouter } from 'next/navigation';
import normalizeText from '@/utils/normalizeText';

// --- TYPE DEFINITIONS ---

// Defines the structure for each tab
interface TabData {
  id: OscratProductVulnerabilityStatus;
  title: string;
  count: number;
}

// Tabs Component: Renders the navigation tabs
interface TabsProps {
  tabs: TabData[];
  activeTab: OscratProductVulnerabilityStatus;
  onTabClick: (tabId: OscratProductVulnerabilityStatus) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="flex">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const isFirst = index === 0;
        const isLast = index === tabs.length - 1;

        let roundedClasses = '';
        if (isFirst) {
          roundedClasses = 'rounded-l-md';
        }
        if (isLast) {
          roundedClasses = isFirst ? 'rounded-md' : 'rounded-r-md';
        }

        const buttonClasses = isActive
          ? 'bg-blue-800 text-white'
          : 'bg-white text-gray-900 hover:bg-gray-100';

        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`border-b border-l border-t ${
              isLast ? 'border-r' : ''
            } border-gray-400 px-2 py-1 text-sm font-medium transition-colors duration-200 ${buttonClasses} ${roundedClasses}`}
          >
            {tab.title} ({tab.count})
          </button>
        );
      })}
    </div>
  );
};

// Item Component: Renders a single incident item
interface ItemProps {
  item: OscratVulnerabilitySummary;
  onShowMore: (id: string) => void;
}

const Item: React.FC<ItemProps> = ({ item, onShowMore }) => {
  const { teamId, productId } = useProductContext();
  const { versionId } = useVersionContext();
  const { project } = useOscratProject(teamId, productId);
  const { version } = useOscratVersion(teamId, productId, versionId);

  const StatusPill: React.FC<{ status: OscratProductVulnerabilityStatus }> = ({
    status,
  }) => {
    // Styling for different statuses based on enum values
    const getStatusPillClasses = (status: OscratProductVulnerabilityStatus) => {
      switch (status) {
        case OscratProductVulnerabilityStatus.ACCEPTED_RISK:
          return 'bg-yellow-200 text-gray-900';
        case OscratProductVulnerabilityStatus.MITIGATED:
          return 'bg-blue-200 text-gray-900';
        case OscratProductVulnerabilityStatus.PATCHED:
          return 'bg-green-200 text-gray-900';
        case OscratProductVulnerabilityStatus.CLOSED:
          return 'bg-gray-200 text-gray-900';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-sm ${getStatusPillClasses(status)}`}
      >
        {normalizeText(status)}
      </span>
    );
  };

  return (
    <div className="flex w-full items-center justify-between rounded-lg border border-gray-400 bg-white p-4 shadow-sm">
      <div className="grid flex-1 grid-cols-6 gap-4">
        <div>
          <div className="mb-1 text-xs text-gray-700">Status</div>
          <div className="mt-2 text-sm font-semibold text-gray-900">
            <StatusPill status={item.status} />
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">ID</div>
          <div className="text-sm font-bold text-gray-900">{item.id}</div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">Severity</div>
          <div className="text-sm font-bold text-gray-900">{item.severity}</div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">Affected Vendor</div>
          <div className="text-sm font-bold text-gray-900">
            {/*!TODO: Check with Radu to see */}
            {'Unknown Vendor'}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">Affected Product</div>
          <div className="text-sm font-bold text-gray-900">{project?.name}</div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">Affected Version</div>
          <div className="text-sm font-bold text-gray-900">
            {version?.version}
          </div>
        </div>
      </div>
      <div className="ml-6 flex-shrink-0">
        <button
          onClick={() => onShowMore(item.id)}
          className="rounded-md border border-gray-400 bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          Show More
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function Index() {
  const { versionId } = useVersionContext();
  const { teamId, productId } = useProductContext();
  const { version } = useOscratVersion(teamId, productId, versionId);
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();

  // Create tabs dynamically based on vulnerability statuses and count vulnerabilities per status
  const tabs: TabData[] = useMemo(() => {
    if (!version?.vulnerabilities) return [];

    const statusCounts = Object.values(OscratProductVulnerabilityStatus).reduce(
      (acc, status) => {
        acc[status] =
          version.vulnerabilities?.filter((vuln) => vuln.status === status)
            .length || 0;
        return acc;
      },
      {} as Record<OscratProductVulnerabilityStatus, number>
    );

    return Object.values(OscratProductVulnerabilityStatus).map((status) => ({
      id: status,
      title:
        status.charAt(0).toUpperCase() +
        status.slice(1).toLowerCase().replace('_', ' '),
      count: statusCounts[status],
    }));
  }, [version?.vulnerabilities]);

  const [activeTab, setActiveTab] = useState<OscratProductVulnerabilityStatus>(
    tabs[0].id
  );

  // --- HANDLERS ---
  const handleShowMore = (id: string) => {
    router.push(`${pathname}/vulnerabilities/${id}`);
  };

  const handleAddVulnerability = () => {
    alert(`"Add Vulnerability" clicked. Functionality not implemented.`);
  };

  // Filter vulnerabilities based on the active tab
  const filteredVulnerabilities = useMemo(() => {
    if (!version?.vulnerabilities) return [];
    return version.vulnerabilities.filter((vuln) => vuln.status === activeTab);
  }, [version?.vulnerabilities, activeTab]);

  // Ensure translations are ready before rendering
  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="w-full">
        {/* Header with Tabs and Button */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-400 bg-white p-4 shadow-sm">
          <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
          <button
            onClick={handleAddVulnerability}
            className="rounded-md border border-gray-400 bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {/*TODO: Ask Radu to also add a hook for vulns, incidents and tasks*/}
            {t('oscrat.ui.add-incident')}
          </button>
        </div>

        {/* List of Items */}
        <div className="space-y-3">
          {filteredVulnerabilities.length > 0 ? (
            filteredVulnerabilities.map((vulnerability) => (
              <Item
                key={vulnerability.id}
                item={vulnerability}
                onShowMore={handleShowMore}
              />
            ))
          ) : (
            <div className="rounded-lg border border-gray-400 bg-white p-10 text-center text-gray-900">
              {t('oscrat.ui.no-vulnerabilities-in-category')}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
