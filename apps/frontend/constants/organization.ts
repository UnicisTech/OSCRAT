import { OscratOrganizationSize } from '@oscrat/model';

export const ORGANIZATION_SIZE_TRANSLATION_KEYS: Record<string, string> = {
  MICRO_ENTERPRISE: 'oscrat.organization.sizes.micro-enterprise',
  SMALL_ENTERPRISE: 'oscrat.organization.sizes.small-enterprise',
  MEDIUM_ENTERPRISE: 'oscrat.organization.sizes.medium-enterprise',
  OTHER: 'oscrat.organization.sizes.other',
};

export const getOrganizationSizeOptions = (
  t: (key: string) => string
): { value: OscratOrganizationSize; label: string }[] => {
  return Object.values(OscratOrganizationSize).map((size) => ({
    value: size,
    label: t(ORGANIZATION_SIZE_TRANSLATION_KEYS[size] || size),
  }));
};
