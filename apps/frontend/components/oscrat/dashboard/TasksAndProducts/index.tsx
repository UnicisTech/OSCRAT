import React, { useMemo } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { useTeamContext } from '@/context/TeamContext';
import { useTranslation } from 'next-i18next';
import { useSearchProducts } from '@/lib/api/hooks/oscrat/projects';
import { OscratProductComplianceStatus, OscratProductVersionStatus } from '@oscrat/model';

const TasksSummaryCard = ({ data }) => {
  const { t, ready } = useTranslation('common');
  const StatusPill = ({ category }) => {
    const { t, ready } = useTranslation('common');
    const hasOpenItems = category.count > 0;

    if (!ready) return null;

    if (hasOpenItems) {
      return (
        <div className="flex items-center rounded-full border border-red-500 px-3 py-1 text-sm">
          <FaExclamationCircle className="mr-1.5 text-red-600" />
          {category.count} {t('oscrat.ui.open')}
        </div>
      );
    }

    return (
      <div className="flex items-center rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
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
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
        {data.categories.map((category) => (
          <div key={category.label} className="flex flex-col">
            <h3 className="mb-2 text-sm text-gray-600">{category.label}</h3>
            <div className="self-start">
              <StatusPill category={category} />
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

  const DetailItem = ({ label, value }) => (
    <div className="">
      <h3 className="mb-1 text-sm text-gray-600">{label}</h3>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  );

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-md md:w-[30%]">
      <h2 className="mb-6 text-lg font-bold text-gray-800">
        {t('products')} ({data.total})
      </h2>
      <div className="flex items-center justify-between space-x-6">
        <DetailItem label="Assessment" value={data.assessment} />
        <DetailItem label="Active" value={data.active} />
        <DetailItem label="Withdrawn" value={data.withdrawn} />
      </div>
    </div>
  );
};

export default function App() {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const { t } = useTranslation('common');
  
  const { data: products, isLoading } = useSearchProducts(team.slug, { 
    includeVersions: true, 
    includeDetails: true 
  });

  const tasksSummary = useMemo(() => {
    if (!products) {
      return {
        totalOpen: 0,
        categories: [
          { label: t('oscrat.ui.vulnerabilities'), count: 0 },
          { label: t('oscrat.ui.incidents'), count: 0 },
          { label: 'SBOM', count: 0 },
          { label: t('oscrat.ui.tech-documentation'), count: 0 },
        ],
      };
    }

    const totalVulnerabilities = products.reduce((sum, product) => {
      return sum + product.versions.reduce((vSum, version) => {
        return vSum + (version.openVulnerabilities || 0);
      }, 0);
    }, 0);

    const totalIncidents = products.reduce((sum, product) => {
      return sum + product.versions.reduce((vSum, version) => {
        return vSum + (version.openIncidents || 0);
      }, 0);
    }, 0);

    const totalSbomReports = products.reduce((sum, product) => {
      return sum + product.versions.reduce((vSum, version) => {
        return vSum + (version.sbomReportsCount || 0);
      }, 0);
    }, 0);

    return {
      totalOpen: totalVulnerabilities + totalIncidents,
      categories: [
        { label: t('oscrat.ui.vulnerabilities'), count: totalVulnerabilities },
        { label: t('oscrat.ui.incidents'), count: totalIncidents },
        { label: 'SBOM', count: totalSbomReports },
        { label: t('oscrat.ui.tech-documentation'), count: 0 },
      ],
    };
  }, [products, t]);

  const productsSummary = useMemo(() => {
    if (!products) {
      return { total: 0, assessment: 0, active: 0, withdrawn: 0 };
    }

    const assessment = products.filter(
      (p) => p.complianceStatus === OscratProductComplianceStatus.NOT_ASSESSED ||
             p.complianceStatus === OscratProductComplianceStatus.IN_PROGRESS
    ).length;

    const active = products.filter(
      (p) => p.versions.some(v => v.status === OscratProductVersionStatus.ACTIVE)
    ).length;

    const withdrawn = products.filter(
      (p) => p.versions.some(v => v.status === OscratProductVersionStatus.WITHDRAWN)
    ).length;

    return {
      total: products.length,
      assessment,
      active,
      withdrawn,
    };
  }, [products]);

  if (isLoading) {
    return (
      <div className="flex w-full justify-center">
        <div className="text-gray-600">{t('loading')}</div>
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
