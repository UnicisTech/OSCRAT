import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import type { Task, Team } from '@oscrat/model';

interface TaskDetailsTabsProps {
  task: Task;
  team: Team;
}

type TabKey = 'files' | 'auditLog' | 'comments';

interface Tab {
  id: TabKey;
  label: string;
}

const TaskDetailsTabs: React.FC<TaskDetailsTabsProps> = ({ task: _task, team: _team }) => {
  const { t, ready } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<TabKey>('files');

  const tabs: Tab[] = [
    {
      id: 'files',
      label: t('files'),
    },
    {
      id: 'auditLog',
      label: t('audit-log'),
    },
    {
      id: 'comments',
      label: t('comments'),
    },
  ];

  const handleTabChange = (tabId: TabKey) => {
    setActiveTab(tabId);
  };

  // TODO: Implement tab content
  const renderTabContent = (tabId: TabKey) => {
    switch (tabId) {
      case 'files':
        return (
          <div className="p-6 text-center text-gray-500">
            <p>{t('files-tab-coming-soon')}</p>
          </div>
        );
      case 'auditLog':
        return (
          <div className="p-6 text-center text-gray-500">
            <p>{t('audit-log-tab-coming-soon')}</p>
          </div>
        );
      case 'comments':
        return (
          <div className="p-6 text-center text-gray-500">
            <p>{t('comments-tab-coming-soon')}</p>
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
