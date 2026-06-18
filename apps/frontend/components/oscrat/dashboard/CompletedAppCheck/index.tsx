import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useTeamContext } from '@/context/TeamContext';
import { formatRiskLevel } from '@/utils/craForm';
import Button from '@/components/button';

interface CompletedAppCheckProps {
  riskLevel: string;
}

export default function CompletedAppCheck({
  riskLevel,
}: CompletedAppCheckProps) {
  const { t, ready } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const router = useRouter();

  const handleAddProduct = () => {
    router.push(`/organization/${teamId}/products/add-product/cache`);
  };

  if (!ready) return null;

  const classification = formatRiskLevel(riskLevel);

  return (
    <div className="flex w-full justify-center">
      <div className="border-line bg-surface rounded-card flex w-full justify-between border">
        {/* Header Section */}
        <div className="p-4">
          <h1 className="text-content text-h6 font-bold">
            {t('oscrat.ui.completed-applicability-check')}
          </h1>
          <p className="text-content-secondary text-c1 mt-1">
            {t('oscrat.ui.use-the-result')}{' '}
            <span className="font-bold text-black"> {classification} </span>{' '}
            {t('product')}
          </p>
        </div>

        <div className="flex justify-end px-4 py-6">
          <Button
            variant="primary"
            size="m"
            onClick={handleAddProduct}
            text={t('add-product')}
          />
        </div>
      </div>
    </div>
  );
}
