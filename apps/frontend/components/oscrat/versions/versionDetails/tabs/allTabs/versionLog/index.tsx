import React, { useState } from 'react';
import { useSearchAuditLogs, useAuditLogFilterOptions } from '@/lib/api/hooks/auditLogs';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import Table from './table';
import { TabLoading } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import type { OscratAuditLogQueryParams } from '@oscrat/model';

export default function Index() {
  const { slug } = useTeamContext();
  const { versionId } = useVersionContext();
  const [filters, setFilters] = useState<Partial<OscratAuditLogQueryParams>>({});

  const { data: filterOptions, isLoading: isLoadingOptions } = useAuditLogFilterOptions(slug);
  const { data, isLoading } = useSearchAuditLogs(slug, { versionId, ...filters });

  if (isLoading) {
    return <TabLoading />;
  }

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        <Table
          logs={data?.data || []}
          filters={filters}
          onFilterChange={setFilters}
          filterOptions={filterOptions}
          isLoadingOptions={isLoadingOptions}
        />
      </div>
    </div>
  );
}
