import { useState } from 'react';
import NotSupportedTab from '@/components/oscrat/products/productDetails/tabs/allTabs/notSupported';
import SupportedTab from '@/components/oscrat/products/productDetails/tabs/allTabs/supported';
import { OscratProductVersionSummary } from '@oscrat/model';
import Index from '@/components/oscrat/products/productDetails/addVersion';
import { useProductContext } from '@/context/ProductContext';
import { useSession } from 'next-auth/react';

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
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { teamId, productId } = useProductContext();
  const { data: session } = useSession();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
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
                ? 'active-tab-button border-b-2 border-blue-500 font-medium text-blue-500'
                : 'inactive-tab-button'
            } mr-1 cursor-pointer px-4 py-2`}
          >
            {tab.label}
          </button>
        ))}

        {buttonText && (
          <button
            type="button"
            className="ml-auto rounded border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
            onClick={handleButtonClick}
          >
            {buttonText}
          </button>
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

      {/* Create Version Modal */}
      <Index
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        teamId={teamId}
        productId={productId}
        createdBy={session?.user?.id || ""}
      />
    </div>
  );
}
