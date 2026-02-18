import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { Task, Team } from '@oscrat/model';
import { useGetTaskLinkedDocumentation } from '@/lib/api/hooks';
import { StatusBadge, Loading } from '@/components/shared';

interface TaskDetailsTabsProps {
  task: Task;
  team: Team;
}

type TabKey = 'documentation';

interface Tab {
  id: TabKey;
  label: string;
}

const TaskDetailsTabs: React.FC<TaskDetailsTabsProps> = ({ task, team }) => {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('documentation');

  const { data: linkedDocs, isLoading: isLoadingDocs } = useGetTaskLinkedDocumentation(
    team.slug,
    task.taskNumber.toString()
  );

  const tabs: Tab[] = [
    {
      id: 'documentation',
      label: t('oscrat.ui.documentation.title'),
    },
  ];

  const handleTabChange = (tabId: TabKey) => {
    setActiveTab(tabId);
  };

  const handleDocClick = (docId: string) => {
    router.push(`/teams/${team.slug}/documentation/${docId}`);
  };

  const renderTabContent = (tabId: TabKey) => {
    switch (tabId) {
      case 'documentation':
        if (isLoadingDocs) {
          return (
            <div className="p-6">
              <Loading />
            </div>
          );
        }
        return linkedDocs && linkedDocs.length > 0 ? (
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
                    {t('title')}
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
                    {t('oscrat.ui.documentation.level.label')}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
                    {t('status')}
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
                    {t('visibility')}
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
                    {t('updated')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {linkedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleDocClick(doc.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{doc.title}</span>
                        {doc.productName && (
                          <span className="text-xs text-gray-500">
                            {doc.productName}
                            {doc.versionName && ` v${doc.versionName}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {doc.productName
                          ? t('oscrat.ui.documentation.level.product')
                          : t('oscrat.ui.documentation.level.organization')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        value={doc.status}
                        label={t(`oscrat.ui.documentation.status.${doc.status.toLowerCase()}`)}
                      />
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <span className={`text-sm ${doc.visibility === 'PUBLIC' ? 'text-green-600' : 'text-gray-500'}`}>
                        {doc.visibility === 'PUBLIC'
                          ? t('oscrat.ui.documentation.visibility.public')
                          : t('oscrat.ui.documentation.visibility.private')}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p className="italic">{t('oscrat.ui.tasks.no-linked-documentation')}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-start" role="tablist" aria-label="Task information sections">
        {tabs.map((tab) => (
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

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-button-${tab.id}`}
          className={`tab-content-panel mt-4 ${activeTab === tab.id ? 'block' : 'hidden'}`}
        >
          {activeTab === tab.id && renderTabContent(tab.id)}
        </div>
      ))}
    </div>
  );
};

export default TaskDetailsTabs;
