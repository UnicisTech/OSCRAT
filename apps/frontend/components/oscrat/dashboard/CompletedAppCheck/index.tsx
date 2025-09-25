import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useTeamContext } from '@/context/TeamContext';
import { formatRiskLevel } from '@/utils/craForm';

interface CompletedAppCheckProps {
  riskLevel: string;
}

export default function CompletedAppCheck({ riskLevel }: CompletedAppCheckProps) {
  const { t, ready } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const router = useRouter();

  const handleAddProduct = () => {
    router.push(`/teams/${teamId}/products/add-product/cache`);
  };

  if (!ready) return null;

  const classification = formatRiskLevel(riskLevel);

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full justify-between rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header Section */}
        <div className="p-4">
          <h1 className="text-lg font-semibold text-gray-800">
            {t('oscrat.ui.completed-applicability-check')}
          </h1>
          <p className="mt-1 text-[13px] text-gray-500">
            {t('oscrat.ui.use-the-result')}{' '}
            <span className="font-bold text-black"> {classification} </span>{' '}
            {t('product')}
          </p>
        </div>

        <div className="flex justify-end px-4 py-6">
          <button
            onClick={handleAddProduct}
            className="rounded border border-gray-400 px-2 py-1 text-[14px] font-semibold text-gray-600"
          >
            {t('add-product')}
          </button>
        </div>
      </div>
    </div>
  );
}
