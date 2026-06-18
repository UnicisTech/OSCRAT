import { useTranslation } from 'next-i18next';
import Loading from '@/components/shared/Loading';

interface TabLoadingProps {
  message?: string;
}

const TabLoading: React.FC<TabLoadingProps> = ({ message }) => {
  const { t } = useTranslation('common');
  const displayMessage = message || t('oscrat.ui.loading');

  return (
    <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-8">
      <Loading />
      <p className="text-content-muted mt-4">{displayMessage}</p>
    </div>
  );
};

export default TabLoading;
