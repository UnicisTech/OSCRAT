export const crudConfig = {
  c: { label: 'Create', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  r: { label: 'Read', bg: 'bg-sky-100', text: 'text-sky-700' },
  u: { label: 'Update', bg: 'bg-amber-100', text: 'text-amber-700' },
  d: { label: 'Delete', bg: 'bg-rose-100', text: 'text-rose-700' },
} as const;

export type CrudType = keyof typeof crudConfig;

export const getCrudConfig = (crud: string) =>
  crudConfig[crud as CrudType] ?? {
    label: crud.toUpperCase(),
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
