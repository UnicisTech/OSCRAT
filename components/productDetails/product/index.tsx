import React from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { useTranslation } from 'next-i18next';
import {
  OscratProductDetail,
  OscratProductSummary,
} from '@/types/oscrat/product';
import { getProductCategoryKey, getProductTypeKey } from '@/utils/translation';

interface ProductProps {
  project: OscratProductSummary | OscratProductDetail;
  onDelete?: () => void;
  onEdit?: () => void;
  onWithdraw?: () => void;
}

const Product: React.FC<ProductProps> = ({
                                           project,
                                           onDelete,
                                           onEdit,
                                           onWithdraw,
                                         }) => {
  const { t, ready } = useTranslation('common');

  // Standard way: don't render until translations are ready
  if (!ready) return null;

  // Handle both summary and detail types for vulnerabilities and incidents
  const openVulnerabilities =
    'openVulnerabilities' in project
      ? project.openVulnerabilities
      : project.vulnerabilities?.length || 0;
  const openIncidents =
    'openIncidents' in project
      ? project.openIncidents
      : project.incidents?.length || 0;

  const displayVulnerabilities =
    openVulnerabilities > 0
      ? `${openVulnerabilities} ${t('oscrat.ui.open')}`
      : t('oscrat.ui.none');
  const displayIncidents =
    openIncidents > 0
      ? `${openIncidents} ${t('oscrat.ui.open')}`
      : t('oscrat.ui.none');

  const vulnerabilityBorderClass =
    openVulnerabilities > 0 ? 'border-red-600' : 'border-gray-300';

  const incidentsBorderClass =
    openIncidents > 0 ? 'border-red-600' : 'border-gray-300';

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-400 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {project.name}
        </div>

        <div className="flex font-medium text-gray-600">
          {onDelete && (
            <div>
              <button onClick={onDelete} className="rounded px-6 py-1 text-sm">
                {t('delete')}
              </button>
            </div>
          )}

          {onWithdraw && (
            <div>
              <button
                onClick={onWithdraw}
                className="rounded px-6 py-1 text-sm"
              >
                {t('oscrat.ui.withdraw')}
              </button>
            </div>
          )}

          {onEdit && (
            <div>
              <button
                onClick={onEdit}
                className="rounded border border-gray-400 px-3 py-1 text-sm text-black hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {t('edit')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="my-2 w-full border-b border-gray-200 dark:border-gray-600" />

      <div className="flex flex-wrap justify-between gap-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.category')}:
          </span>
          <span className="font-semibold text-black dark:text-gray-100">
            {t(getProductCategoryKey(project.productCategory))}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.role')}:
          </span>
          <span className="font-semibold text-black dark:text-gray-100">
            {t(getProductTypeKey(project.type))}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.open-incidents')}:
          </span>
          <div
            className={`inline-flex font-semibold text-black dark:text-gray-100`}
          >
            {openIncidents > 0 ? (
              <div
                className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${incidentsBorderClass}`}
              >
                <BsExclamationCircleFill className="text-red-600" />
                <p>{displayIncidents}</p>
              </div>
            ) : (
              <p
                className={`${incidentsBorderClass} rounded-full border border-gray-400 px-2 py-0.5`}
              >
                {displayIncidents}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.open-vulnerabilities')}:
          </span>
          <div
            className={`inline-flex items-center gap-2 font-semibold text-black dark:text-gray-100`}
          >
            {openVulnerabilities > 0 ? (
              <div
                className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${vulnerabilityBorderClass}`}
              >
                <BsExclamationCircleFill className="text-red-600" />
                <p>{displayVulnerabilities}</p>
              </div>
            ) : (
              <p
                className={`rounded-full border border-gray-400 px-2 py-0.5 ${vulnerabilityBorderClass}`}
              >
                {displayVulnerabilities}
              </p>
            )}
          </div>
        </div>
        <div className="flex min-w-[120px] flex-col">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.external-reporting')}:
          </span>
          <span className="font-semibold text-black dark:text-gray-100">
            {project.externalReportingAcronyms?.join(', ') ||
              t('oscrat.ui.n-a')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Product;
