import React from 'react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import env from '@/lib/env';
import { Button } from '@/components/shared';

interface PublicUrlDisplayProps {
  slug: string;
  docSlug: string;
  productId?: string | null;
  versionId?: string | null;
}

const PublicUrlDisplay: React.FC<PublicUrlDisplayProps> = ({
  slug,
  docSlug,
  productId,
  versionId,
}) => {
  const { t } = useTranslation('common');

  const baseUrl = env.publicAppUrl;
  const publicUrl =
    productId && versionId
      ? `${baseUrl}/organization/${slug}/public/products/${productId}/versions/${versionId}/documentation/${docSlug}`
      : `${baseUrl}/organization/${slug}/public/documentation/${docSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success(t('oscrat.ui.documentation.url-copied'));
  };

  return (
    <div className="bg-success-subtle border-success-border rounded-card border p-4">
      <label className="text-success-emphasis mb-2 block text-sm font-medium">
        {t('oscrat.ui.documentation.public-url')}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={publicUrl}
          className="border-success-border bg-surface text-content-secondary rounded-input flex-1 border px-3 py-2 text-sm"
        />
        <Button size="m" variant="secondary" onClick={handleCopy}>
          {t('oscrat.ui.documentation.copy-url')}
        </Button>
      </div>
    </div>
  );
};

export default PublicUrlDisplay;
