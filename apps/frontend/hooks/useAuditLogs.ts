import { useState, useCallback } from 'react';
import { useSearchAuditLogs } from '@/lib/api/hooks/auditLogs';
import type { OscratAuditLogQueryParams } from '@oscrat/model';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

export function useAuditLogs(teamSlug: string) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(LISTING_PAGE_SIZE);
  const [filters, setFilters] = useState<Partial<OscratAuditLogQueryParams>>(
    {}
  );

  const params: OscratAuditLogQueryParams = { page, pageSize, ...filters };

  const { data, isLoading, isError, error } = useSearchAuditLogs(
    teamSlug,
    params
  );

  const goToNextPage = useCallback(() => {
    if (data && page < data.totalPages) setPage(page + 1);
  }, [data, page]);

  const goToPreviousPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const updateFilters = useCallback(
    (newFilters: Partial<OscratAuditLogQueryParams>) => {
      setFilters(newFilters);
      setPage(1); // Reset to first page when filters change
    },
    []
  );

  return {
    auditLogs: data?.data ?? [],
    total: data?.total ?? 0,

    currentPage: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    pageSize: data?.pageSize ?? LISTING_PAGE_SIZE,

    goToNextPage,
    goToPreviousPage,
    goToPage,
    prevButtonDisabled: page === 1,
    nextButtonDisabled: !data || page >= data.totalPages,

    filters,
    updateFilters,

    isLoading,
    isError,
    error,
  };
}

export default useAuditLogs;
