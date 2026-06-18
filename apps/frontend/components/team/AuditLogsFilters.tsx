import React from 'react';
import { useTranslation } from 'next-i18next';
import Select, { type ValueType } from '@atlaskit/select';
import { DatePicker } from '@atlaskit/datetime-picker';
import { WithoutRing } from 'sharedStyles';
import {
  CrudType,
  type AuditLogFilterOptions,
  type OscratAuditLogQueryParams,
} from '@oscrat/model';
import { crudConfig } from '@/lib/auditUtils';
import { oscratEntityTypeTranslationMap } from '@/utils/translation';
import { getFilterSelectStyles } from '@/components/shared/filterSelectStyles';
import Button from '@/components/button';

interface Option {
  label: string;
  value: string;
}

interface AuditLogsFiltersProps {
  filters: Partial<OscratAuditLogQueryParams>;
  onFilterChange: (filters: Partial<OscratAuditLogQueryParams>) => void;
  filterOptions?: AuditLogFilterOptions;
  isLoadingOptions?: boolean;
}

const AuditLogsFilters: React.FC<AuditLogsFiltersProps> = ({
  filters,
  onFilterChange,
  filterOptions,
  isLoadingOptions,
}) => {
  const { t } = useTranslation('common');

  // Build user options
  const userOptions: Option[] = (filterOptions?.users ?? []).map((user) => ({
    label: user.userName || user.userEmail || user.userId,
    value: user.userId,
  }));

  // Build entity type options
  const entityOptions: Option[] = (filterOptions?.targetTypes ?? []).map(
    (type) => ({
      label: t(oscratEntityTypeTranslationMap[type], { defaultValue: type }),
      value: type,
    })
  );

  // Build crud options using CrudType from model and labels from crudConfig
  const crudOptions: Option[] = Object.entries(CrudType).map(([key, value]) => {
    const cfg = crudConfig[value as keyof typeof crudConfig];
    return {
      value,
      label: cfg ? t(cfg.labelKey, { defaultValue: key }) : key,
    };
  });

  // Get current values for selects
  const currentUserOption =
    userOptions.find((o) => o.value === filters.userId) || null;
  const currentEntityOption =
    entityOptions.find((o) => o.value === filters.targetType) || null;
  const currentCrudOption =
    crudOptions.find((o) => o.value === filters.crud) || null;

  // Check if any filter is active
  const hasActiveFilters =
    filters.userId ||
    filters.targetType ||
    filters.crud ||
    filters.startDate ||
    filters.endDate;

  const handleUserChange = (option: ValueType<Option, false>) => {
    onFilterChange({ ...filters, userId: option?.value || undefined });
  };

  const handleEntityChange = (option: ValueType<Option, false>) => {
    onFilterChange({ ...filters, targetType: option?.value || undefined });
  };

  const handleCrudChange = (option: ValueType<Option, false>) => {
    onFilterChange({ ...filters, crud: option?.value || undefined });
  };

  const handleStartDateChange = (value: string) => {
    onFilterChange({ ...filters, startDate: value || undefined });
  };

  const handleEndDateChange = (value: string) => {
    onFilterChange({ ...filters, endDate: value || undefined });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[130px]">
        <WithoutRing>
          <Select<Option>
            inputId="audit-filter-user"
            options={userOptions}
            value={currentUserOption}
            onChange={handleUserChange}
            placeholder={t('all-users')}
            isClearable
            isLoading={isLoadingOptions}
            spacing="compact"
            styles={getFilterSelectStyles<Option>()}
          />
        </WithoutRing>
      </div>

      <div className="min-w-[130px]">
        <WithoutRing>
          <Select<Option>
            inputId="audit-filter-entity"
            options={entityOptions}
            value={currentEntityOption}
            onChange={handleEntityChange}
            placeholder={t('all-entities')}
            isClearable
            isLoading={isLoadingOptions}
            spacing="compact"
            styles={getFilterSelectStyles<Option>()}
          />
        </WithoutRing>
      </div>

      <div className="min-w-[120px]">
        <WithoutRing>
          <Select<Option>
            inputId="audit-filter-operation"
            options={crudOptions}
            value={currentCrudOption}
            onChange={handleCrudChange}
            placeholder={t('all-operations')}
            isClearable
            spacing="compact"
            styles={getFilterSelectStyles<Option>()}
          />
        </WithoutRing>
      </div>

      <div className="min-w-[120px]">
        <WithoutRing>
          <DatePicker
            selectProps={{
              inputId: 'audit-filter-start-date',
              styles: getFilterSelectStyles(),
            }}
            value={filters.startDate || ''}
            onChange={handleStartDateChange}
            placeholder={t('from')}
            spacing="compact"
          />
        </WithoutRing>
      </div>

      <div className="min-w-[120px]">
        <WithoutRing>
          <DatePicker
            selectProps={{
              inputId: 'audit-filter-end-date',
              styles: getFilterSelectStyles(),
            }}
            value={filters.endDate || ''}
            onChange={handleEndDateChange}
            placeholder={t('to')}
            spacing="compact"
          />
        </WithoutRing>
      </div>

      {hasActiveFilters && (
        <Button variant="tertiary" size="m" onClick={handleClearFilters}>
          {t('clear-filters')}
        </Button>
      )}
    </div>
  );
};

export default AuditLogsFilters;
