import { formatDateTime } from '@/utils/dateFormat';

export const crudConfig = {
  c: { labelKey: 'oscrat.audit.crud.create' },
  r: { labelKey: 'oscrat.audit.crud.read' },
  u: { labelKey: 'oscrat.audit.crud.update' },
  d: { labelKey: 'oscrat.audit.crud.delete' },
} as const;

export type CrudType = keyof typeof crudConfig;

export const getCrudConfig = (crud: string) =>
  crudConfig[crud as CrudType] ?? { labelKey: '' };

export const formatTimestamp = (date: Date | string, includeSeconds = false) =>
  formatDateTime(date, includeSeconds);
