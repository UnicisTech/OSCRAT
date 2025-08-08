import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratOrganization } from '@/hooks/oscrat/useOscratOrganization';
import { useProductFiltering } from '@/hooks/useProductFiltering';
import SearchBar from '@/components/oscrat/products/productsList/searchBar';
import ProductComponent from '@/components/oscrat/products/productsList/product';
import {
  EmptyState,
  LoadingState,
  ErrorState,
} from '@/components/shared/StateComponents';

export function ProductListContent() {
  const { slug: teamId } = useTeamContext();
  const { organization, isLoading, isError } = useOscratOrganization(teamId);
  const router = useRouter();
  const pathname = usePathname();

  const products = organization?.products || [];

  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    handleFilterChange,
    filteredProducts,
    filterOptions,
  } = useProductFiltering(products);

  const navigateToAddPage = () => {
    router.push(`${pathname}/new`);
  };

  const handleShowMore = (productId: string) => {
    router.push(`${pathname}/${productId}`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState />;
  }

  return (
    <div className="flex w-full flex-col justify-center">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddProduct={navigateToAddPage}
        // @ts-ignore-next-line
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={
          handleFilterChange as (filterType: any, value: string) => void
        }
      />

      <div className="flex w-full flex-col gap-4 rounded-lg bg-white dark:bg-gray-800">
        {filteredProducts.length === 0 ? (
          <EmptyState />
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
  );
}
