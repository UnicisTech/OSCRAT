import { useState, ReactNode } from 'react';
import { useTranslation } from 'next-i18next';

export type TabConfig = {
  id: string;
  label: string;
  component: ReactNode;
};

type TabsManagerProps = {
  tabs: TabConfig[];
  defaultActiveTab?: string;
  buttonText?: string;
  onButtonClick?: () => void;
};

export default function TabsManager({
  tabs,
  defaultActiveTab,
  buttonText,
  onButtonClick,
}: TabsManagerProps) {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="mt-6">
      <div
        className={`flex ${buttonText ? 'justify-between' : 'justify-start'} `}
        role="tablist"
        aria-label="Information sections"
      >
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
            {t(tab.label)}
          </button>
        ))}

        {buttonText && (
          <button
            type="button"
            className="ml-auto rounded border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
            onClick={() => (onButtonClick ? onButtonClick() : undefined)}
          >
            {buttonText}
          </button>
        )}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-button-${tab.id}`}
          className={`tab-content-panel mt-4 ${activeTab === tab.id ? 'block' : 'hidden'}`}
        >
          {activeTab === tab.id && tab.component}
        </div>
      ))}
    </div>
  );
}
