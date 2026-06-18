import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { useTeamContext } from '@/context/TeamContext';
import { useTranslation } from 'next-i18next';
import { useDashboard } from '@/hooks/oscrat/useDashboard';
import DetailItem from '@/components/shared/DetailItem';

const CategoryPill = ({ category }: { category: { count: number } }) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  if (category.count > 0) {
    return (
      <div className="border-danger flex items-center rounded-full border px-3 py-1 text-sm">
        <FaExclamationCircle className="text-danger mr-1.5" />
        {category.count} {t('oscrat.ui.open')}
      </div>
    );
  }

  return (
    <div className="border-line bg-surface-muted text-content-secondary flex items-center rounded-full border px-3 py-1 text-sm font-semibold">
      {t('oscrat.ui.none')}
    </div>
  );
};

const TasksSummaryCard = ({ data }) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;
  return (
    <div className="border-line bg-surface rounded-card w-full border p-6 md:w-[70%]">
      <h2 className="text-content mb-6 text-lg font-bold">
        {t('tasks-open')} ({data.totalOpen})
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
        {data.categories.map((category) => (
          <div key={category.label} className="flex flex-col">
            <h3 className="text-content-secondary mb-2 text-sm">
              {category.label}
            </h3>
            <div className="self-start">
              <CategoryPill category={category} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductsSummaryCard = ({ data }) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="border-line bg-surface rounded-card w-full border p-6 md:w-[30%]">
      <h2 className="text-content mb-6 text-lg font-bold">
        {t('products')} ({data.total})
      </h2>
      <div className="flex items-center justify-between space-x-6">
        <DetailItem
          label="Assessment"
          value={data.assessment}
          variant="large"
        />
        <DetailItem label="Active" value={data.active} variant="large" />
        <DetailItem label="Withdrawn" value={data.withdrawn} variant="large" />
      </div>
    </div>
  );
};

export default function App() {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const { t } = useTranslation('common');

  const { summary, isLoading } = useDashboard(team.slug);

  const openVulnerabilities = summary?.vulnerabilities.open || 0;
  const openIncidents = summary?.incidents.open || 0;
  const totalOpen = openVulnerabilities + openIncidents;

  const tasksSummary = {
    totalOpen,
    categories: [
      { label: t('oscrat.ui.vulnerabilities'), count: openVulnerabilities },
      { label: t('oscrat.ui.incidents'), count: openIncidents },
      { label: 'SBOM', count: summary?.sbomReports.total || 0 },
      {
        label: t('oscrat.ui.tech-documentation'),
        count: summary?.techDocumentation.total || 0,
      },
    ],
  };

  const productsSummary = {
    total: summary?.products.total || 0,
    assessment: summary?.products.inAssessment || 0,
    active: summary?.products.active || 0,
    withdrawn: summary?.products.withdrawn || 0,
  };

  if (isLoading) {
    return (
      <div className="flex w-full justify-center">
        <div className="text-content-secondary">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <TasksSummaryCard data={tasksSummary} />
        <ProductsSummaryCard data={productsSummary} />
      </div>
    </div>
  );
}
