import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

const LoadingPlaceholder = () => {
  const { t } = useTranslation('common');
  return (
    <div className="flex h-[400px] items-center justify-center rounded-md border border-gray-200 bg-gray-50">
      <span className="text-gray-500">{t('loading-editor')}</span>
    </div>
  );
};

const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), {
  ssr: false,
  loading: () => <LoadingPlaceholder />,
});

export default MarkdownEditor;
