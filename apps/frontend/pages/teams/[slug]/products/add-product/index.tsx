'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useTeamContext } from '@/context/TeamContext';
import { withTeamLayout } from '@/lib/layout-helpers';

type AddProductOption = 'scratch' | 'cache' | 'existing';

export default function AddProduct() {
  const { t } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<AddProductOption>('scratch');

  const handleNext = () => {
    switch (selectedOption) {
      case 'scratch':
        router.push(`/teams/${teamId}/form`);
        break;
      case 'cache':
        router.push(`/teams/${teamId}/products/add-product/cache`);
        break;
      case 'existing':
        router.push(`/teams/${teamId}/products/add-product/existing`);
        break;
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header Section */}
        <div className="p-10 pb-2">
          <h1 className="text-[20px] font-semibold text-gray-800">
            {t('oscrat.ui.how-to-add-new-product')}
          </h1>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center space-x-3 rounded-md p-4 transition-colors hover:bg-gray-50">
              <input
                type="radio"
                name="addProductOption"
                value="scratch"
                checked={selectedOption === 'scratch'}
                onChange={(e) => setSelectedOption(e.target.value as AddProductOption)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('oscrat.ui.from-scratch')}</span>
            </label>

            <label className="flex cursor-pointer items-center space-x-3 rounded-md p-4 transition-colors hover:bg-gray-50">
              <input
                type="radio"
                name="addProductOption"
                value="cache"
                checked={selectedOption === 'cache'}
                onChange={(e) => setSelectedOption(e.target.value as AddProductOption)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('oscrat.ui.from-cache')}</span>
            </label>

            <label className="flex cursor-pointer items-center space-x-3 rounded-md p-4 transition-colors hover:bg-gray-50">
              <input
                type="radio"
                name="addProductOption"
                value="existing"
                checked={selectedOption === 'existing'}
                onChange={(e) => setSelectedOption(e.target.value as AddProductOption)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('oscrat.ui.from-existing-product')}</span>
            </label>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center pl-10 justify-start space-x-3 rounded-b-lg border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('close')}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('next')}
          </button>
        </div>
      </div>
    </div>
  );
}

AddProduct.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
