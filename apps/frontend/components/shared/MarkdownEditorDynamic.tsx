import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

const LoadingPlaceholder = () => {
  const { t } = useTranslation('common');
  return (
    <div className="border-line-subtle bg-surface-muted flex h-[400px] items-center justify-center rounded-md border">
      <span className="text-content-muted">{t('loading-editor')}</span>
    </div>
  );
};

const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), {
  ssr: false,
  loading: () => <LoadingPlaceholder />,
});

export default MarkdownEditor;
