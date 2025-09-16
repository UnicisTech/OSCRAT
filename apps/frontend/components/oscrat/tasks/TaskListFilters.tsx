import React from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import SelectWithLabel from '@/components/shared/SelectWithLabel';
import statuses from '@/components/defaultLanding/data/statuses.json';

interface FilterState {
  status: string;
  product: string;
}

interface TaskListFiltersProps {
  filters: FilterState;
  onFilterChange: (filterType: keyof FilterState) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClearFilters: () => void;
  mockProducts: Array<{ value: string; label: string }>;
}

const TaskListFilters: React.FC<TaskListFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  mockProducts,
}) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-[150px]">
          <SelectWithLabel
            name="status"
            label={t('status')}
            value={filters.status}
            onChange={onFilterChange('status')}
            options={[
              { value: '', label: t('all') },
              ...statuses.map(status => ({
                value: status.value,
                label: status.label,
              })),
            ]}
          />
        </div>
        
        <div className="min-w-[150px]">
          <SelectWithLabel
            name="product"
            label={t('product')}
            value={filters.product}
            onChange={onFilterChange('product')}
            options={[
              { value: '', label: t('all') },
              ...mockProducts,
            ]}
          />
        </div>
        
        {(filters.status || filters.product) && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClearFilters}
            className="self-end"
          >
            {t('clear-filters')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskListFilters;
