import type { TFunction } from 'next-i18next';
import {
  TASK_STATUS_TRANSLATION_MAP,
  TASK_TYPE_TRANSLATION_MAP,
} from '@/constants/taskStatuses';
import {
  oscratIncidentStatusTranslationMap,
  oscratProductCategoryTranslationMap,
  oscratProductStatusTranslationMap,
  oscratProductTypeTranslationMap,
  oscratProductVersionStatusTranslationMap,
  oscratVulnerabilitySeverityTranslationMap,
  oscratVulnerabilityStatusTranslationMap,
} from '@/utils/translation';

const FIELD_LABEL_KEYS: Record<string, string> = {
  title: 'title',
  name: 'name',
  status: 'status',
  type: 'type',
  taskType: 'type',
  duedate: 'due-date',
  assigneeId: 'assignee',
  description: 'description',
  version: 'version',
  releaseDate: 'oscrat.ui.release-date',
  productCategory: 'oscrat.ui.category',
  role: 'role',
  email: 'email',
  url: 'url',
  provider: 'provider',
  targetBranch: 'oscrat.ui.target-branch',
  classification: 'classification',
  attackType: 'attack-type',
  scope: 'scope',
  expiresAt: 'expires-at',
  isActive: 'active',
};

type EnumKeyMap = Record<string, string>;
const ENUM_VALUE_KEYS: Record<string, Record<string, EnumKeyMap>> = {
  Task: {
    status: TASK_STATUS_TRANSLATION_MAP,
    taskType: TASK_TYPE_TRANSLATION_MAP,
  },
  Product: {
    status: oscratProductStatusTranslationMap,
    type: oscratProductTypeTranslationMap,
    productCategory: oscratProductCategoryTranslationMap,
  },
  ProductVersion: { status: oscratProductVersionStatusTranslationMap },
  Vulnerability: {
    severity: oscratVulnerabilitySeverityTranslationMap,
    status: oscratVulnerabilityStatusTranslationMap,
  },
  Incident: { status: oscratIncidentStatusTranslationMap },
};

const humanize = (field: string) =>
  field
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const auditFieldLabel = (field: string, t: TFunction): string => {
  const key = FIELD_LABEL_KEYS[field];
  return key ? t(key) : humanize(field);
};

export const auditEnumLabel = (
  targetType: string,
  field: string,
  value: unknown,
  t: TFunction
): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const key = ENUM_VALUE_KEYS[targetType]?.[field]?.[value];
  return key ? t(key) : undefined;
};
