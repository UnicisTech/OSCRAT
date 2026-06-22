import React, { useState, useCallback } from 'react';
import {
  useSearchAuditLogs,
  useAuditLogFilterOptions,
} from '@/lib/api/hooks/auditLogs';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import Table from './table';
import { TabLoading } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import type { OscratAuditLogQueryParams } from '@oscrat/model';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

export default function Index() {
  const { slug } = useTeamContext();
  const { versionId } = useVersionContext();
  const [filters, setFilters] = useState<Partial<OscratAuditLogQueryParams>>(
    {}
  );
  const [page, setPage] = useState(1);

  const { data: filterOptions, isLoading: isLoadingOptions } =
    useAuditLogFilterOptions(slug);
  const { data, isLoading } = useSearchAuditLogs(
    slug,
    {
      versionId,
      page,
      pageSize: LISTING_PAGE_SIZE,
      ...filters,
    },
    { enabled: !!versionId }
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<OscratAuditLogQueryParams>) => {
      setFilters(newFilters);
      setPage(1);
    },
    []
  );

  if (isLoading) {
    return <TabLoading />;
  }

  return (
    <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
      <div className="w-full">
        <Table
          logs={data?.data || []}
          totalLogs={data?.total || 0}
          currentPage={page}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
          isLoadingOptions={isLoadingOptions}
          teamSlug={slug}
        />
      </div>
    </div>
  );
}
