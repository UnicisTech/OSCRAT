import { useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Button from '@/components/button';

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
  const { t, ready } = useTranslation('common');
  const router = useRouter();

  const initialTab =
    (router.query.tab as string) || defaultActiveTab || tabs[0]?.id;
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromQuery = router.query.tab as string;
    if (tabFromQuery && tabs.find((tab) => tab.id === tabFromQuery)) {
      setActiveTab(tabFromQuery);
    }
  }, [router.query.tab, tabs]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: tabId },
      },
      undefined,
      { shallow: true }
    );
  };

  if (!ready) return null;

  return (
    <div className="mt-6">
      <div
        className={`border-line-subtle flex border-b ${buttonText ? 'justify-between' : 'justify-start'} `}
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
                ? 'active-tab-button border-info text-info border-b-2 font-medium'
                : 'inactive-tab-button text-content-secondary hover:text-content font-medium'
            } text-b2 mr-1 cursor-pointer px-3 py-3`}
          >
            {t(tab.label)}
          </button>
        ))}

        {buttonText && (
          <Button
            type="button"
            variant="secondary"
            size="m"
            className="ml-auto"
            onClick={() => (onButtonClick ? onButtonClick() : undefined)}
          >
            {buttonText}
          </Button>
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
