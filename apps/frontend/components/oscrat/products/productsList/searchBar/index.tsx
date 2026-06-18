'use client';

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { OscratProductCategory, OscratOrganizationRole } from '@oscrat/model';
import { getProductCategoryKey, getOrgRoleKey } from '@/utils/translation';
import Button from '@/components/button';

interface FilterableProductFields {
  category?: string;
  role?: string;
  openIncidents?: string;
  openVulnerabilities?: string;
  externalReporting?: string;
  status?: string;
}

interface FilterOptions {
  [key: string]: string[] | undefined;
}

interface ActiveFilters {
  [key: string]: string | undefined;
}

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onAddProduct: () => void;
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: (
    filterType: keyof FilterableProductFields,
    value: string
  ) => void;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  onAddProduct,
  filterOptions,
  activeFilters,
  onFilterChange,
}: HeaderProps) {
  const { t } = useTranslation('common');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterSelect = (
    filterType: keyof FilterableProductFields,
    value: string
  ) => {
    onFilterChange(filterType, value);
  };

  const clearFilter = (filterType: keyof FilterableProductFields) => {
    onFilterChange(filterType, '');
  };

  const formatKey = (key: string) => {
    // Special cases for specific filter keys
    if (key === 'openIncidents') return 'Incidents';
    if (key === 'openVulnerabilities') return 'Vulnerabilities';

    // Default formatting for other keys
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  //TODO: yuck
  const getOptionLabel = (key: string, option: string) => {
    if (
      key === 'category' &&
      Object.values(OscratProductCategory).includes(
        option as OscratProductCategory
      )
    ) {
      return t(getProductCategoryKey(option as OscratProductCategory));
    }
    if (
      key === 'role' &&
      Object.values(OscratOrganizationRole).includes(
        option as OscratOrganizationRole
      )
    ) {
      return t(getOrgRoleKey(option as OscratOrganizationRole));
    }
    if (key === 'externalReporting' && option === 'None') {
      return t('no-reporting');
    }
    if (key === 'status') {
      return t(
        `oscrat.compliance.status.${option.toLowerCase().replace('_', '-')}`
      );
    }
    if (key === 'openIncidents' || key === 'openVulnerabilities') {
      if (option === 'true') return t('true');
      if (option === 'false') return t('false');
    }
    return option;
  };

  // List of allowed filter key
  const allowedFilterKeys: (keyof FilterableProductFields)[] = [
    'category',
    'role',
    'status',
    // 'openIncidents',
    // 'openVulnerabilities',
    'externalReporting',
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <MagnifyingGlassIcon className="text-content-placeholder pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t('search-by-title')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-line rounded-input focus:border-primary focus:ring-primary h-10 w-full border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 md:w-56"
        />
      </div>

      <div className="relative">
        <Button
          type="button"
          variant="secondary"
          size="l"
          onClick={() => setShowFilters(!showFilters)}
          title={t('filters')}
          aria-expanded={showFilters}
          icon={<FunnelIcon />}
        />
        {showFilters && (
          <div className="bg-surface shadow-8 rounded-card absolute right-0 z-10 mt-2 w-72 origin-top-right p-4 ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-content text-lg font-medium">
                {t('filters')}
              </h3>
              <Button
                variant="tertiary"
                size="m"
                onClick={() => setShowFilters(false)}
                title={t('close-filters')}
                icon={<XMarkIcon className="text-content-muted h-5 w-5" />}
              />
            </div>
            {allowedFilterKeys.map((key) => {
              const options = filterOptions[key];
              if (!options) return null;

              return (
                <div key={key} className="mb-4">
                  <label
                    htmlFor={`filter-${key}`}
                    className="text-content-secondary block text-sm font-medium capitalize"
                  >
                    {formatKey(key)}
                  </label>
                  <div className="flex items-center">
                    <select
                      id={`filter-${key}`}
                      name={`filter-${key}`}
                      value={activeFilters[key] || ''}
                      onChange={(e) =>
                        handleFilterSelect(
                          key as keyof FilterableProductFields,
                          e.target.value
                        )
                      }
                      className="border-line focus:border-primary focus:ring-primary rounded-input mt-1 block w-full py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm"
                    >
                      <option value="">{t('all')}</option>
                      {options.map((option) => (
                        <option key={option} value={option}>
                          {getOptionLabel(key, option)}
                        </option>
                      ))}
                    </select>
                    {activeFilters[key] && (
                      <Button
                        variant="tertiary"
                        size="s"
                        className="ml-2"
                        onClick={() =>
                          clearFilter(key as keyof FilterableProductFields)
                        }
                        title={`${t('clear')} ${formatKey(key)} ${t('filter')}`}
                        icon={
                          <XMarkIcon className="text-content-muted h-4 w-4" />
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button type="button" variant="primary" onClick={onAddProduct}>
        {t('add-product')}
      </Button>
    </div>
  );
}
