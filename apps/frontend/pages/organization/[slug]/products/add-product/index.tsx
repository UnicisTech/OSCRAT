'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useTeamContext } from '@/context/TeamContext';
import { withTeamLayout } from '@/lib/layout-helpers';
import Button from '@/components/button';

type AddProductOption = 'scratch' | 'cache' | 'existing';

export default function AddProduct() {
  const { t } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const router = useRouter();
  const [selectedOption, setSelectedOption] =
    useState<AddProductOption>('scratch');

  const handleNext = () => {
    switch (selectedOption) {
      case 'scratch':
        router.push(`/organization/${teamId}/form`);
        break;
      case 'cache':
        router.push(`/organization/${teamId}/products/add-product/cache`);
        break;
      case 'existing':
        router.push(`/organization/${teamId}/products/add-product/existing`);
        break;
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="flex w-full justify-center">
      <div className="border-line bg-surface rounded-card w-full max-w-2xl border">
        {/* Header Section */}
        <div className="p-10 pb-2">
          <h1 className="text-content text-[20px] font-semibold">
            {t('oscrat.ui.how-to-add-new-product')}
          </h1>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="space-y-4">
            <label className="hover:bg-surface-muted flex cursor-pointer items-center space-x-3 rounded-md p-4 transition-colors">
              <input
                type="radio"
                name="addProductOption"
                value="scratch"
                checked={selectedOption === 'scratch'}
                onChange={(e) =>
                  setSelectedOption(e.target.value as AddProductOption)
                }
                className="border-line text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-content-secondary text-sm font-medium">
                {t('oscrat.ui.from-scratch')}
              </span>
            </label>

            <label className="hover:bg-surface-muted flex cursor-pointer items-center space-x-3 rounded-md p-4 transition-colors">
              <input
                type="radio"
                name="addProductOption"
                value="cache"
                checked={selectedOption === 'cache'}
                onChange={(e) =>
                  setSelectedOption(e.target.value as AddProductOption)
                }
                className="border-line text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-content-secondary text-sm font-medium">
                {t('oscrat.ui.from-cache')}
              </span>
            </label>

            <label className="hover:bg-surface-muted flex cursor-pointer items-center space-x-3 rounded-md p-4 transition-colors">
              <input
                type="radio"
                name="addProductOption"
                value="existing"
                checked={selectedOption === 'existing'}
                onChange={(e) =>
                  setSelectedOption(e.target.value as AddProductOption)
                }
                className="border-line text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-content-secondary text-sm font-medium">
                {t('oscrat.ui.from-existing-product')}
              </span>
            </label>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-line-subtle flex items-center justify-start space-x-3 rounded-b-lg border-t p-4 pl-10">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            text={t('close')}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            text={t('next')}
          />
        </div>
      </div>
    </div>
  );
}

AddProduct.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
