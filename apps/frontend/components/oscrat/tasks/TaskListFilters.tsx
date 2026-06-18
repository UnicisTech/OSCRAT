import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Button from '@/components/button';
import { TASK_STATUS_TRANSLATION_MAP } from '../../../constants/taskStatuses';

interface FilterState {
  status: string[];
  productId: string[];
  versionId: string[];
}

interface TaskListFiltersProps {
  filters: FilterState;
  onFilterToggle: (filterType: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  products: Array<{ value: string; label: string }>;
  versions: Array<{ value: string; label: string }>;
}

const TaskListFilters: React.FC<TaskListFiltersProps> = ({
  filters,
  onFilterToggle,
  onClearFilters,
  products,
  versions,
}) => {
  const { t, ready } = useTranslation('common');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (!ready) return null;

  const statusOptions = Object.entries(TASK_STATUS_TRANSLATION_MAP).map(
    ([status, translationKey]) => ({
      value: status,
      label: t(translationKey),
    })
  );

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.productId.length > 0 ||
    filters.versionId.length > 0;

  const FilterDropdown = ({
    label,
    filterKey,
    options,
    selectedValues,
  }: {
    label: string;
    filterKey: keyof FilterState;
    options: Array<{ value: string; label: string }>;
    selectedValues: string[];
  }) => {
    const isOpen = openDropdown === filterKey;
    const selectedCount = selectedValues.length;

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : filterKey)}
          className={`rounded-input text-b2 text-content flex h-8 min-w-[150px] items-center justify-between gap-2 border px-2 ${
            selectedCount > 0
              ? 'border-info bg-info-subtle'
              : 'border-line bg-surface'
          }`}
        >
          <span className="truncate">
            {selectedCount > 0 ? `${label} (${selectedCount})` : label}
          </span>
          <ChevronDownIcon
            className={`text-content-placeholder h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpenDropdown(null)}
            />
            <div className="bg-surface border-line shadow-8 rounded-input absolute z-20 mt-1 max-h-60 w-full overflow-auto border">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="hover:bg-surface-muted flex cursor-pointer items-center gap-2 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => onFilterToggle(filterKey, option.value)}
                    className="border-line text-primary focus:ring-primary rounded"
                  />
                  <span className="truncate text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-3">
        <FilterDropdown
          label={t('status')}
          filterKey="status"
          options={statusOptions}
          selectedValues={filters.status}
        />

        <FilterDropdown
          label={t('product')}
          filterKey="productId"
          options={products}
          selectedValues={filters.productId}
        />

        <FilterDropdown
          label={t('version')}
          filterKey="versionId"
          options={versions}
          selectedValues={filters.versionId}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="secondary" size="m" onClick={onClearFilters}>
          {t('clear-filters')}
        </Button>
      )}
    </div>
  );
};

export default TaskListFilters;
