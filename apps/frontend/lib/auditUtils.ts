const badge = { bg: 'bg-gray-100', text: 'text-gray-700' } as const;

export const crudConfig = {
  c: { labelKey: 'oscrat.audit.crud.create', ...badge },
  r: { labelKey: 'oscrat.audit.crud.read', ...badge },
  u: { labelKey: 'oscrat.audit.crud.update', ...badge },
  d: { labelKey: 'oscrat.audit.crud.delete', ...badge },
} as const;

export type CrudType = keyof typeof crudConfig;

export const getCrudConfig = (crud: string) =>
  crudConfig[crud as CrudType] ?? {
    labelKey: '',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  };

export const formatTimestamp = (date: Date | string, includeSeconds = false) => {
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  });
};
