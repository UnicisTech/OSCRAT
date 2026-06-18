import { useState } from 'react';
import Button from '@/components/button';
import NotSupportedTab from '@/components/oscrat/products/productDetails/tabs/allTabs/notSupported';
import SupportedTab from '@/components/oscrat/products/productDetails/tabs/allTabs/supported';
import { OscratProductVersionSummary } from '@oscrat/model';

export type TabConfig = {
  id: string;
  label: string;
  data: OscratProductVersionSummary[];
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
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderTabContent = (tab: TabConfig) => {
    switch (tab.id) {
      case 'supported':
        return <SupportedTab data={tab.data} />;
      case 'notSupported':
        return <NotSupportedTab data={tab.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      <div
        className={`flex ${buttonText ? 'justify-between' : 'justify-start'} `}
        role="tablist"
        aria-label="Information sections"
      >
        {tabs?.map((tab) => (
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
                ? 'active-tab-button border-info text-info border-b-2 font-medium'
                : 'inactive-tab-button'
            } mr-1 cursor-pointer px-4 py-2`}
          >
            {tab.label}
          </button>
        ))}

        {buttonText && onButtonClick && (
          <Button
            type="button"
            variant="primary"
            size="m"
            className="ml-auto"
            onClick={onButtonClick}
            text={buttonText}
          />
        )}
      </div>

      {tabs?.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-button-${tab.id}`}
          className={`tab-content-panel mt-4 ${activeTab === tab.id ? 'block' : 'hidden'}`}
        >
          {activeTab === tab.id && renderTabContent(tab)}
        </div>
      ))}
    </div>
  );
}
