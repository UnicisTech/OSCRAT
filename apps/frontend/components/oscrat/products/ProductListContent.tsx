import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTeamContext } from '@/context/TeamContext';
import { useTeamProducts } from '@/lib/api/hooks/teams';
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
  const { data: products, isLoading, isError } = useTeamProducts(teamId);
  const router = useRouter();
  const pathname = usePathname();

  const productsList = products || [];

  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    handleFilterChange,
    filteredProducts,
    filterOptions,
  } = useProductFiltering(productsList);

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
