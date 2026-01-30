import React from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import env from '@/lib/env';

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
      ? `${baseUrl}/teams/${slug}/public/products/${productId}/versions/${versionId}/documentation/${docSlug}`
      : `${baseUrl}/teams/${slug}/public/documentation/${docSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success(t('oscrat.ui.documentation.url-copied'));
  };

  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-4">
      <label className="block text-sm font-medium text-green-800 mb-2">
        {t('oscrat.ui.documentation.public-url')}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={publicUrl}
          className="flex-1 rounded-md border border-green-300 bg-white px-3 py-2 text-sm text-gray-700"
        />
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {t('oscrat.ui.documentation.copy-url')}
        </Button>
      </div>
    </div>
  );
};

export default PublicUrlDisplay;
