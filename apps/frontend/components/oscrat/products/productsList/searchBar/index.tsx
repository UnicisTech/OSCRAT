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
    <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold">
          {t('oscrat.ui.products-list')}
        </h1>
        <p className="text-[12px] text-gray-500">
          {t('oscrat.ui.add-new-product-verify')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-4 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('search-by-title')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 max-w-[150px] !rounded-full border border-gray-300 py-2 pl-4 pr-8 text-sm"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex h-9 w-9 items-center justify-center rounded bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 text-black" />
          </button>
          {showFilters && (
            <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('filters')}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title={t('close-filters')}
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              {allowedFilterKeys.map((key) => {
                const options = filterOptions[key];
                if (!options) return null;

                return (
                  <div key={key} className="mb-4">
                    <label
                      htmlFor={`filter-${key}`}
                      className="block text-sm font-medium capitalize text-gray-700 dark:text-gray-300"
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
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">{t('all')}</option>
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {getOptionLabel(key, option)}
                          </option>
                        ))}
                      </select>
                      {activeFilters[key] && (
                        <button
                          onClick={() =>
                            clearFilter(key as keyof FilterableProductFields)
                          }
                          className="ml-2 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                          title={`${t('clear')} ${formatKey(key)} ${t('filter')}`}
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mr-1 h-7 w-[2px] bg-gray-300" />

        <button
          type="button"
          className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          onClick={onAddProduct}
        >
          {t('add-product')}
        </button>
      </div>
    </div>
  );
}
