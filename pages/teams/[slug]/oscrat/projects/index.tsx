'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SearchBar from '@/components/productsList/searchBar';
import ProductComponent from '@/components/productsList/product';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratOrganization } from '@/hooks/oscrat/useOscratOrganization';
import type { OscratProductSummary } from '@/types/oscrat/product';
import { OscratProductCategory, OscratProductType } from '@prisma/client';
import AccountLayout from '@/components/layouts/AccountLayout';
import TeamLayout from '@/components/layouts/TeamLayout';

// Define specific filterable fields
type ProductFilters = {
  category?: string;
  role?: string;
  addedBy?: string;
  externalReporting?: string;
};

function matchesFilters(
  product: OscratProductSummary,
  filters: ProductFilters
): boolean {
  // Category
  if (filters.category && filters.category !== '') {
    if (product.productCategory !== filters.category) {
      return false;
    }
  }

  // Role (Product Type)
  if (filters.role && filters.role !== '') {
    if (product.type !== filters.role) {
      return false;
    }
  }

  // Added by
  if (filters.addedBy && filters.addedBy !== '') {
    if (product.createdBy !== filters.addedBy) {
      return false;
    }
  }

  // External reporting
  if (filters.externalReporting && filters.externalReporting !== '') {
    if (filters.externalReporting === 'None') {
      if (product.externalReportingAcronyms.length > 0) {
        return false;
      }
    } else {
      if (
        !product.externalReportingAcronyms.includes(filters.externalReporting)
      ) {
        return false;
      }
    }
  }

  return true;
}

function ProductList() {
  const { t } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const { organization, isLoading, isError } = useOscratOrganization(teamId);
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ProductFilters>({});

  const navigateToAddPage = () => {
    router.push(`${pathname}/new`);
  };

  const handleShowMore = (productId: string) => {
    router.push(`${pathname}/${productId}`);
  };

  // Get products from organization summary or fallback to empty array
  const products: OscratProductSummary[] = organization?.products || [];

  // Apply search and filters
  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => matchesFilters(product, activeFilters));

  // Generate filter options for each specific filter with translations
  const filterOptions = {
    category: Object.values(OscratProductCategory),
    role: Object.values(OscratProductType),
    addedBy: Array.from(new Set(products.map((p) => p.createdBy))),
    externalReporting: [
      ...Array.from(
        new Set(products.flatMap((p) => p.externalReportingAcronyms))
      ),
      'None',
    ].sort(),
  };

  const handleFilterChange = (
    filterType: keyof ProductFilters,
    value: string
  ) => {
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex w-full flex-col justify-center">
        <p className="py-4 text-center dark:text-gray-300">
          {t('loading-project-details')}
        </p>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex w-full flex-col justify-center">
        <p className="py-4 text-center text-red-500 dark:text-red-400">
          {t('unknown-error')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full flex-col justify-center">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddProduct={navigateToAddPage}
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={
            handleFilterChange as (filterType: any, value: string) => void
          }
          filterableKeys={['category', 'role', 'addedBy', 'externalReporting']}
        />

        <div className="flex w-full flex-col gap-4 rounded-lg bg-white dark:bg-gray-800">
          {filteredProducts.length === 0 ? (
            <p className="py-4 text-center dark:text-gray-300">
              {t('no-projects-found')}
            </p>
          ) : (
            filteredProducts.map((product) => (
              <ProductComponent
                key={product.id}
                project={product}
                onShowMore={() => handleShowMore(product.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

ProductList.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default ProductList;
