import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useVersionContext } from '@/context/VersionContext';
import { useProductContext } from '@/context/ProductContext';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { usePathname, useRouter } from 'next/navigation';
import normalizeText from '@/utils/normalizeText';
import {
  OscratProductIncidentStatus,
  OscratProductIncidentType,
  OscratIncidentSummary,
} from '@oscrat/model';

interface TabData {
  id: OscratProductIncidentStatus;
  title: string;
  count: number;
}

interface TabsProps {
  tabs: TabData[];
  activeTab: OscratProductIncidentStatus;
  onTabClick: (tabId: OscratProductIncidentStatus) => void;
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
            className={`border-b border-l border-t ${isLast ? 'border-r' : ''} border-gray-400 px-2 py-1 text-sm font-medium transition-colors duration-200 ${buttonClasses} ${roundedClasses}`}
          >
            {tab.title} ({tab.count})
          </button>
        );
      })}
    </div>
  );
};

interface ItemProps {
  item: OscratIncidentSummary;
  onShowMore: (id: string) => void;
}

const Item: React.FC<ItemProps> = ({ item, onShowMore }) => {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  const { teamId, projectId } = useProductContext();
  const { versionId } = useVersionContext();
  const { project } = useOscratProject(teamId, projectId);
  const { version } = useOscratVersion(teamId, projectId, versionId);

  // Normalize the status and type text for display
  const normalizeText = (text: string): string => {
    return text
      .split('_')
      .filter((word) => word.length > 0) // Remove empty strings from consecutive underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const StatusPill: React.FC<{ status: OscratProductIncidentStatus }> = ({
    status,
  }) => {
    const getStatusPillClasses = (status: OscratProductIncidentStatus) => {
      switch (status) {
        case OscratProductIncidentStatus.NOT_REPORTED:
          return 'bg-red-200 text-gray-900';
        case OscratProductIncidentStatus.INITIAL_ALERT_SENT:
          return 'bg-yellow-200 text-gray-900';
        case OscratProductIncidentStatus.DETAILED_REPORT_SENT:
          return 'bg-blue-200 text-gray-900';
        case OscratProductIncidentStatus.FINAL_REPORT_SENT:
          return 'bg-green-200 text-gray-900';
        case OscratProductIncidentStatus.REPORTING_COMPLETE:
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
      <div className="grid flex-1 grid-cols-5 gap-4">
        <div>
          <div className="mb-1 text-xs text-gray-700">Status</div>
          <div className="mt-2 text-sm font-semibold text-gray-900">
            <StatusPill status={item.status} />
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">{t('id')}</div>
          <div className="text-sm font-bold text-gray-900">
            {item.incidentReference}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">
            {t('oscrat.ui.classification')}
          </div>
          <div className="text-sm font-bold text-gray-900">
            {normalizeText(item.type)}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">
            {t('oscrat.ui.attack-type')}
          </div>
          <div className="text-sm font-bold text-gray-900">
            {normalizeText(item.type)}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-700">
            {t('oscrat.ui.asset-details')}
          </div>
          <div className="text-sm font-bold text-gray-900">
            {project?.name || 'N/A'}
          </div>
        </div>
      </div>
      <div className="ml-6 flex-shrink-0">
        <button
          onClick={() => onShowMore(item.id)}
          className="rounded-md border border-gray-400 bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {t('oscrat.ui.show-more')}
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function Index() {
  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  const router = useRouter();
  const pathname = usePathname();
  const { versionId } = useVersionContext();
  const { teamId, projectId } = useProductContext();
  const { version } = useOscratVersion(teamId, projectId, versionId);

  // Create tabs dynamically based on incident statuses and count incidents per status
  const tabs: TabData[] = useMemo(() => {
    if (!version?.incidents) return [];

    const statusCounts = Object.values(OscratProductIncidentStatus).reduce(
      (acc, status) => {
        acc[status] =
          version.incidents?.filter((incident) => incident.status === status)
            .length || 0;
        return acc;
      },
      {} as Record<OscratProductIncidentStatus, number>
    );

    return Object.values(OscratProductIncidentStatus).map((status) => ({
      id: status,
      title: normalizeText(status),
      count: statusCounts[status],
    }));
  }, [version?.incidents]);

  // Set default active tab to first available status or NOT_REPORTED
  const [activeTab, setActiveTab] = useState<OscratProductIncidentStatus>(
    tabs.length > 0 ? tabs[0].id : OscratProductIncidentStatus.NOT_REPORTED
  );

  // --- HANDLERS ---
  const handleShowMore = (id: string) => {
    router.push(`${pathname}/incidents/${id}`);
  };

  const handleAddIncident = () => {
    alert(`"Add Incident" clicked. Functionality not implemented.`);
  };

  // Filter incidents based on the active tab
  const filteredIncidents = useMemo(() => {
    if (!version?.incidents) return [];
    return version.incidents.filter(
      (incident) => incident.status === activeTab
    );
  }, [version?.incidents, activeTab]);

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
            onClick={handleAddIncident}
            className="rounded-md border border-gray-400 bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {t('oscrat.ui.add-incident')}
          </button>
        </div>

        {/* List of Items */}
        <div className="space-y-3">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <Item
                key={incident.id}
                item={incident}
                onShowMore={handleShowMore}
              />
            ))
          ) : (
            <div className="rounded-lg border border-gray-400 bg-white p-10 text-center text-gray-500 shadow-sm">
              {t('oscrat.ui.no-incidents-in-category')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
