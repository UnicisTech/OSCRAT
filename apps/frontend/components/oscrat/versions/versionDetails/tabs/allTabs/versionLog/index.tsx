import React from 'react';
import { useSearchAuditLogs } from '@/lib/api/hooks/auditLogs';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import Table from './table';
import { TabLoading } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';

export default function Index() {
  const { slug } = useTeamContext();
  const { versionId } = useVersionContext();

  const { data, isLoading } = useSearchAuditLogs(slug, { versionId });

  if (isLoading) {
    return <TabLoading />;
  }

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        <Table logs={data?.data || []} />
      </div>
    </div>
  );
}
