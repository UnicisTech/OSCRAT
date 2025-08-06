import React, { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { useProductContext } from '@/context/ProductContext';
import { useTranslation } from 'next-i18next';

// TODO: De legat cand termina Radu de facut hook/api endpoint pt getAllProducts(details not summary)
const MOCK_TASKS_SUMMARY = {
  totalOpen: 29,
  categories: [
    { label: 'Vulnerabilities', count: 2 },
    { label: 'Incidents', count: 2 },
    { label: 'SBOM', count: 0 },
    { label: 'Tech. Documentation', count: 2 },
  ],
};

const MOCK_PRODUCTS_SUMMARY = {
  total: 12,
  assessment: 6,
  active: 5,
  withdrawn: 1,
};

const TasksSummaryCard = ({ data }) => {
  const { t, ready } = useTranslation('common');
  const StatusPill = ({ category }) => {
    const { t, ready } = useTranslation('common');
    const hasOpenItems = category.count > 0;
    const { teamId } = useProductContext();

    if (!ready) return null;

    if (hasOpenItems) {
      return (
        <div className="flex items-center justify-center rounded-full border border-red-500 px-1 py-1 text-sm">
          <FaExclamationCircle className="mr-1.5 text-red-600" />
          {MOCK_TASKS_SUMMARY.totalOpen} {t('oscrat.ui.open')}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 px-1 py-1 text-sm font-semibold text-gray-700">
        {t('oscrat.ui.none')}
      </div>
    );
  };

  if (!ready) return null;
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-md md:w-[70%]">
      <h2 className="mb-6 text-lg font-bold text-gray-800">
        {t('tasks-open')} ({data.totalOpen})
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-center md:grid-cols-4">
        {data.categories.map((category) => (
          <div key={category.label}>
            <h3 className="mb-2 text-sm text-gray-600">{category.label}</h3>
            <StatusPill category={category} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductsSummaryCard = ({ data }) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  const DetailItem = ({ label, value }) => (
    <div className="text-center">
      <h3 className="mb-1 text-sm text-gray-600">{label}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-md md:w-[30%]">
      <h2 className="mb-6 text-lg font-bold text-gray-800">
        {t('products')} ({data.total})
      </h2>
      <div className="flex items-center justify-around space-x-6">
        <DetailItem label="Assessment" value={data.assessment} />
        <DetailItem label="Active" value={data.active} />
        <DetailItem label="Withdrawn" value={data.withdrawn} />
      </div>
    </div>
  );
};

export default function App() {
  const [tasksSummary, setTasksSummary] = useState(MOCK_TASKS_SUMMARY);
  const [productsSummary, setProductsSummary] = useState(MOCK_PRODUCTS_SUMMARY);

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <TasksSummaryCard data={tasksSummary} />
        <ProductsSummaryCard data={productsSummary} />
      </div>
    </div>
  );
}
