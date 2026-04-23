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
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';

const PRODUCTS_PER_PAGE = 12;

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
    router.push(`${pathname}/add-product`);
  };

  const handleShowMore = (productId: string) => {
    router.push(`${pathname}/${productId}`);
  };

  const {
    currentPage,
    totalPages,
    pageData: paginatedProducts,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(filteredProducts, PRODUCTS_PER_PAGE);

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
          <>
            {paginatedProducts.map((product) => (
              <ProductComponent
                key={product.id}
                project={product}
                onShowMore={() => handleShowMore(product.id)}
              />
            ))}
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                prevButtonDisabled={prevButtonDisabled}
                nextButtonDisabled={nextButtonDisabled}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
                showItemCount
                totalItems={filteredProducts.length}
                itemsPerPage={PRODUCTS_PER_PAGE}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
