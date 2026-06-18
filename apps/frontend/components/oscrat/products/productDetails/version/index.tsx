import { useTranslation } from 'next-i18next';
import { usePathname, useRouter } from 'next/navigation';
import type { OscratProductVersionSummary } from '@oscrat/model';
import React from 'react';
import { getProductVersionStatusKey } from '@/utils/translation';
import Button from '@/components/button';
import Card from '@/components/oscrat/shared/Card';
import MetaField from '@/components/oscrat/shared/MetaField';
import CountChip from '@/components/oscrat/shared/CountChip';
import StatusPill from '@/components/oscrat/shared/StatusPill';

interface VersionProps {
  data: OscratProductVersionSummary;
  variant?: 'supported' | 'notSupported';
}

const Version: React.FC<VersionProps> = ({
  data,
  variant = 'supported',
}: VersionProps) => {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();

  const handleShowMore = () => {
    router.push(`${pathname}/versions/${id}`);
  };

  if (!ready) return null;

  const { id, version: title, status } = data;

  const openLabel = (count: number) =>
    count > 0 ? `${count} ${t('oscrat.ui.open')}` : t('oscrat.ui.none');

  const showMoreButton = (
    <Button
      variant="secondary"
      size="m"
      onClick={() => handleShowMore()}
      text={t('oscrat.ui.show-more')}
    />
  );

  // If status is not supported, show simplified variant
  if (variant === 'notSupported') {
    return (
      <Card className="flex flex-col gap-2">
        <div className="flex items-center">
          <div className="flex flex-1 flex-col justify-center">
            <div className="text-h6 text-content font-bold">
              {t('version')} - {title}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <MetaField label={t('status')}>
              <StatusPill
                status={status}
                label={t(getProductVersionStatusKey(status))}
              />
            </MetaField>
          </div>

          <div className="ml-12 flex flex-1 justify-end">{showMoreButton}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="text-h6 text-content font-bold">
          {t('version')} - {title}
        </div>

        <div className="text-content-secondary text-b2 flex flex-wrap items-start gap-8">
          <MetaField className="min-w-0" label={t('status')}>
            <StatusPill
              status={status}
              label={t(getProductVersionStatusKey(status))}
            />
          </MetaField>
          <MetaField className="min-w-0" label={t('oscrat.ui.incidents')}>
            <CountChip
              count={data.openIncidents}
              displayText={openLabel(data.openIncidents)}
            />
          </MetaField>
          <MetaField className="min-w-0" label={t('oscrat.ui.vulnerabilities')}>
            <CountChip
              count={data.openVulnerabilities}
              displayText={openLabel(data.openVulnerabilities)}
            />
          </MetaField>
          <MetaField className="min-w-0" label={t('oscrat.ui.tasks.title')}>
            <CountChip
              count={data.openTasks}
              displayText={openLabel(data.openTasks)}
              iconClassName="text-primary"
            />
          </MetaField>
        </div>

        <div className="flex justify-end">{showMoreButton}</div>
      </div>
    </Card>
  );
};

export default Version;
