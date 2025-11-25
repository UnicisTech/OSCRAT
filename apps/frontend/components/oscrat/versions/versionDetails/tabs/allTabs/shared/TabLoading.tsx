import { useTranslation } from 'next-i18next';
import Loading from '@/components/shared/Loading';

interface TabLoadingProps {
  message?: string;
}

const TabLoading: React.FC<TabLoadingProps> = ({ message }) => {
  const { t } = useTranslation('common');
  const displayMessage = message || t('oscrat.ui.loading');

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-8">
      <Loading />
      <p className="mt-4 text-gray-500">{displayMessage}</p>
    </div>
  );
};

export default TabLoading;

