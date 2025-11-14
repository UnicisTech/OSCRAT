import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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

  const statusOptions = Object.entries(TASK_STATUS_TRANSLATION_MAP).map(([status, translationKey]) => ({
    value: status,
    label: t(translationKey),
  }));

  const hasActiveFilters = filters.status.length > 0 || filters.productId.length > 0 || filters.versionId.length > 0;

  const FilterDropdown = ({ 
    label, 
    filterKey, 
    options, 
    selectedValues 
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
          className={`flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-md min-w-[150px] ${
            selectedCount > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
          }`}
        >
          <span className="truncate">
            {selectedCount > 0 ? `${label} (${selectedCount})` : label}
          </span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setOpenDropdown(null)}
            />
            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => onFilterToggle(filterKey, option.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm truncate">{option.label}</span>
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
        <button
          onClick={onClearFilters}
          className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {t('clear-filters')}
        </button>
      )}
    </div>
  );
};

export default TaskListFilters;
