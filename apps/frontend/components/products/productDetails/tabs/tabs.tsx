import type { OscratProductVersionSummary } from '@oscrat/model';

const createTabsConfig = (versions: OscratProductVersionSummary[]) => {
  const supportedVersions =
    versions?.filter((version) => version.status !== 'DEPRECATED') || [];
  const notSupportedVersions =
    versions?.filter((version) => version.status === 'DEPRECATED') || [];

  return [
    {
      id: 'supported',
      label: 'Active/Supported',
      data: supportedVersions,
    },
    {
      id: 'notSupported',
      label: 'Not Supported',
      data: notSupportedVersions,
    },
  ];
};

export default createTabsConfig;
