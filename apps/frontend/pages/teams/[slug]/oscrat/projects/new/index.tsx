'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratOrganization } from '@/hooks/oscrat/useOscratOrganization';
import { OscratProductType, OscratProductCategory } from '@oscrat/model';
import type { OscratProductCreate } from '@oscrat/model';
import { getProductTypeKey, getProductCategoryKey } from '@/utils/translation';
import toast from 'react-hot-toast';
import { withProductLayout } from '@/lib/layout-helpers';

export default function AddProject() {
  const { t } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const { data: session } = useSession();
  const router = useRouter();
  const { createProject, isLoading } = useOscratOrganization(teamId);

  const [name, setName] = useState('');
  const [type, setType] = useState<OscratProductType | ''>('');
  const [category, setCategory] = useState<OscratProductCategory | ''>('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    // Clear previous error
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!type) {
      setError('Product type is required');
      return;
    }

    if (!category) {
      setError('Product category is required');
      return;
    }

    if (!session?.user?.id) {
      setError('User information not available');
      return;
    }

    try {
      const projectData: OscratProductCreate = {
        name: name.trim(),
        type: type as OscratProductType,
        productCategory: category as OscratProductCategory,
        createdBy: session.user.id,
      };

      await createProject(projectData);

      // Show success toast
      toast.success('Project created successfully');
      // Navigate back to projects list on success
      router.replace(`/teams/${teamId}/oscrat/projects`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const productTypes = Object.values(OscratProductType);
  const productCategories = Object.values(OscratProductCategory);

  return (
    <div className="mt-10 flex w-full justify-center">
      <div className="w-full rounded-lg border bg-white p-6 shadow-lg md:w-1/2 lg:w-1/3 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
        <h2 className="mb-4 text-xl font-medium dark:text-gray-100">
          {t('add-new-project')}
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              {t('title')} *
            </label>
            <input
              type="text"
              placeholder={t('title')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              {t('oscrat.ui.product-type')} *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OscratProductType)}
              className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
            >
              <option value="">{t('choose')}</option>
              {productTypes.map((productType) => (
                <option key={productType} value={productType}>
                  {t(getProductTypeKey(productType))}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              {t('oscrat.ui.category')} *
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as OscratProductCategory)
              }
              className="w-full rounded border bg-gray-100 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
            >
              <option value="">{t('choose')}</option>
              {productCategories.map((productCategory) => (
                <option key={productCategory} value={productCategory}>
                  {t(getProductCategoryKey(productCategory))}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`/teams/${teamId}/oscrat/projects`)}
            className="flex-1 rounded bg-gray-500 p-2 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading || !name.trim() || !type || !category}
            className="flex-1 rounded bg-blue-500 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-800 dark:disabled:bg-gray-600"
          >
            {isLoading ? t('loading') : t('create')}
          </button>
        </div>
      </div>
    </div>
  );
}

AddProject.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
