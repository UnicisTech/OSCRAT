import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductSummary } from '@oscrat/model';
import { getProductCategoryKey, getProductTypeKey } from '@/utils/translation';
import Button from '@/components/button';
import ActiveBadge from './ActiveBadge';
import Card from '@/components/oscrat/shared/Card';
import Divider from '@/components/oscrat/shared/Divider';
import MetaField from '@/components/oscrat/shared/MetaField';
import CountChip from '@/components/oscrat/shared/CountChip';
import AcronymBadge from '@/components/oscrat/shared/AcronymBadge';

interface ProductProps {
  project: OscratProductSummary;
  onShowMore: () => void;
}

const Product: React.FC<ProductProps> = ({ project, onShowMore }) => {
  const { t, ready } = useTranslation('common');

  // Memoize computed values
  const {
    openVulnerabilities,
    openIncidents,
    displayVulnerabilities,
    displayIncidents,
    complianceStatusKey,
  } = useMemo(() => {
    const vulnerabilities = project.totalOpenVulnerabilities;
    const incidents = project.totalOpenIncidents;

    return {
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
  }, [project, t]);

  const reportingOrganizations = useMemo(() => {
    return project.reportingOrganizations?.join(', ') || t('oscrat.ui.n-a');
  }, [project.reportingOrganizations, t]);

  if (!ready) return null;

  return (
    <Card
      as="article"
      className="flex flex-col gap-3"
      aria-labelledby={`product-${project.id}-title`}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3
            id={`product-${project.id}-title`}
            className="text-content text-h6 font-bold"
          >
            {project.name}
          </h3>
          {project.acronym && (
            <AcronymBadge acronym={project.acronym} size="sm" />
          )}
        </div>

        <nav
          className="text-content-secondary flex items-center gap-4 font-medium"
          role="navigation"
          aria-label="Product actions"
        >
          <ActiveBadge status={project.status} />

          {onShowMore && (
            <Button
              variant="secondary"
              size="m"
              onClick={onShowMore}
              aria-label={`Show more details for ${project.name}`}
            >
              {t('oscrat.ui.show-more')}
            </Button>
          )}
        </nav>
      </header>

      <Divider />

      <section
        className="text-content-secondary text-b2 grid grid-cols-6 gap-4"
        aria-label="Product details"
      >
        <MetaField
          label={t('oscrat.ui.category')}
          value={t(getProductCategoryKey(project.productCategory))}
        />

        <MetaField
          label={t('oscrat.ui.product-type')}
          value={t(getProductTypeKey(project.type))}
        />

        <MetaField label={t('oscrat.ui.open-incidents')}>
          <CountChip
            count={openIncidents}
            displayText={displayIncidents}
            ariaLabel={`${openIncidents} open incidents for ${project.name}`}
          />
        </MetaField>

        <MetaField label={t('oscrat.ui.open-vulnerabilities')}>
          <CountChip
            count={openVulnerabilities}
            displayText={displayVulnerabilities}
            ariaLabel={`${openVulnerabilities} open vulnerabilities for ${project.name}`}
          />
        </MetaField>

        <MetaField
          label={t('oscrat.ui.external-reporting')}
          value={reportingOrganizations}
        />

        <MetaField label={t('status')}>
          <span className="text-b2 text-content font-medium capitalize">
            {t(complianceStatusKey)}
          </span>
        </MetaField>
      </section>
    </Card>
  );
};

export default Product;
