import { useState, useMemo } from 'react';
import type { OscratProductSummary } from '@oscrat/model';
import {
  ProductFilters,
  filterProducts,
  generateFilterOptions,
} from '@/utils/productFilters';

export function useProductFiltering(products: OscratProductSummary[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ProductFilters>({});

  const filteredProducts = useMemo(() => {
    return filterProducts(products, searchTerm, activeFilters);
  }, [products, searchTerm, activeFilters]);

  const filterOptions = useMemo(() => {
    return generateFilterOptions(products);
  }, [products]);

  const handleFilterChange = (
    filterType: keyof ProductFilters,
    value: string
  ) => {
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    handleFilterChange,
    filteredProducts,
    filterOptions,
  };
}
