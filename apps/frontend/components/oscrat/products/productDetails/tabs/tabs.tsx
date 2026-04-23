import type { OscratProductVersionSummary } from '@oscrat/model';
import type { TFunction } from 'next-i18next';
import type { TabConfig } from '@/components/shared/TabsManager';

export const createTabsConfig = (
  versions: OscratProductVersionSummary[],
  t: TFunction
): TabConfig[] => {
  const supportedVersions =
    versions?.filter((version) => version.status !== 'DEPRECATED') || [];
  const notSupportedVersions =
    versions?.filter((version) => version.status === 'DEPRECATED') || [];

  return [
    {
      id: 'supported',
      label: t('oscrat.ui.versions.lists.active-supported'),
      data: supportedVersions,
    },
    {
      id: 'notSupported',
      label: t('oscrat.ui.versions.lists.not-supported'),
      data: notSupportedVersions,
    },
  ];
};

export default createTabsConfig;
