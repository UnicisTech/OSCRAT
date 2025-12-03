import { OscratOrganizationRole } from '@oscrat/model';
import {
  useGetTeamDataList,
  useGetTeamData,
  useUpsertTeamData,
  useDeleteTeamData,
} from '@/lib/api/hooks/teamData';
import type { TeamDataUpsertRequest } from '@/lib/api/endpoints/teamData';

export const DATA_KEY_NAMESPACES = {
  COMPLIANCE: 'compliance',
} as const;

export const COMPLIANCE_MODIFIERS = {
  OVERRIDE: 'override',
} as const;

export function buildDataKey(...segments: string[]): string {
  return segments.map((s) => s.toLowerCase()).join(':');
}

export function buildDataKeyComplianceOverride(
  role: OscratOrganizationRole,
  language: string
): string {
  return buildDataKey(
    DATA_KEY_NAMESPACES.COMPLIANCE,
    role,
    COMPLIANCE_MODIFIERS.OVERRIDE,
    language
  );
}

export function useTeamData(slug: string) {
  const {
    data: dataList,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
  } = useGetTeamDataList(slug);

  const upsertMutation = useUpsertTeamData(slug);

  const upsertData = async (dataKey: string, payload: string) => {
    const request: TeamDataUpsertRequest = { dataKey, payload };
    return upsertMutation.mutateAsync(request);
  };

  const isLoading = isListLoading || upsertMutation.isPending;

  return {
    dataList,
    isLoading,
    isListLoading,
    isListError,
    listError,
    upsertData,
    isUpserting: upsertMutation.isPending,
    upsertError: upsertMutation.error,
  };
}

export function useTeamDataItem(slug: string, dataKey: string) {
  const { data, isLoading, isError, error } = useGetTeamData(slug, dataKey);

  const deleteMutation = useDeleteTeamData(slug, dataKey);

  const deleteData = async () => {
    return deleteMutation.mutateAsync();
  };

  return {
    data,
    isLoading,
    isError,
    error,
    deleteData,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
