import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductSummary } from '@oscrat/model';
import { getProductCategoryKey, getProductTypeKey } from '@/utils/translation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import ActiveBadge from './ActiveBadge';
import InfoField from './InfoField';

interface ProductProps {
  project: OscratProductSummary;
  onShowMore: () => void;
}

const Product: React.FC<ProductProps> = ({ project, onShowMore }) => {
  const { t, ready } = useTranslation('common');
  const pathname = usePathname();

  // Memoize computed values
  const {
    formPathName,
    openVulnerabilities,
    openIncidents,
    displayVulnerabilities,
    displayIncidents,
    complianceStatusKey,
  } = useMemo(() => {
    const vulnerabilities = project.totalOpenVulnerabilities;
    const incidents = project.totalOpenIncidents;

    return {
      formPathName: `${pathname}/${project.id}/form`,
      openVulnerabilities: vulnerabilities,
      openIncidents: incidents,
      displayVulnerabilities:
        vulnerabilities > 0
          ? `${vulnerabilities} ${t('oscrat.ui.open')}`
          : t('oscrat.ui.none'),
      displayIncidents:
        incidents > 0
          ? `${incidents} ${t('oscrat.ui.open')}`
          : t('oscrat.ui.none'),
      complianceStatusKey: `oscrat.compliance.status.${project.complianceStatus
        .toLowerCase()
        .replace('_', '-')}`,
    };
  }, [project, pathname, t]);

  const reportingOrganizations = useMemo(() => {
    return project.reportingOrganizations?.join(', ') || t('oscrat.ui.n-a');
  }, [project.reportingOrganizations, t]);

  if (!ready) return null;

  return (
    <article
      className="flex flex-col gap-2 rounded-lg border border-gray-400 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      aria-labelledby={`product-${project.id}-title`}
    >
      <header className="flex items-center justify-between">
        <h3
          id={`product-${project.id}-title`}
          className="text-sm font-semibold uppercase text-black dark:text-gray-100"
        >
          {project.name}
        </h3>

        <nav
          className="flex gap-6 font-medium text-gray-600"
          role="navigation"
          aria-label="Product actions"
        >
          <ActiveBadge status={project.status} />

          <Link
            href={formPathName}
            aria-label={`Go to form for ${project.name}`}
          >
            <button
              type="button"
              className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('go-to-form')}
            </button>
          </Link>
          {onShowMore && (
            <button
              onClick={onShowMore}
              className="rounded border border-gray-400 px-6 py-1 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              aria-label={`Show more details for ${project.name}`}
            >
              {t('oscrat.ui.show-more')}
            </button>
          )}
        </nav>
      </header>

      <hr className="my-2 w-full border-gray-200 dark:border-gray-600" />

      <section
        className="grid grid-cols-6 gap-4 text-sm text-gray-700 dark:text-gray-300"
        aria-label="Product details"
      >
        <InfoField
          label={t('oscrat.ui.category')}
          value={t(getProductCategoryKey(project.productCategory))}
        />

        <InfoField
          label={t('oscrat.ui.role')}
          value={t(getProductTypeKey(project.type))}
        />

        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.open-incidents')}:
          </span>
          <StatusBadge
            count={openIncidents}
            displayText={displayIncidents}
            ariaLabel={`${openIncidents} open incidents for ${project.name}`}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.open-vulnerabilities')}:
          </span>
          <StatusBadge
            count={openVulnerabilities}
            displayText={displayVulnerabilities}
            ariaLabel={`${openVulnerabilities} open vulnerabilities for ${project.name}`}
          />
        </div>

        <InfoField
          label={t('oscrat.ui.external-reporting')}
          value={reportingOrganizations}
        />

        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
            {t('status')}:
          </span>
          <span className="font-semibold capitalize text-black dark:text-gray-100">
            {t(complianceStatusKey)}
          </span>
        </div>
      </section>
    </article>
  );
};

export default Product;
