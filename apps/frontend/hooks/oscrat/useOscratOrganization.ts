import {
  useGetOrganizationSummary,
  useGetOrganizationDetail,
  useCreateOrganization,
  useUpdateOrganization,
} from '@/lib/api/hooks/oscrat/organization';
import { useCreateProject } from '@/lib/api/hooks/oscrat/projects';
import type {
  OscratOrganizationCreate,
  OscratOrganizationUpdate,
} from '@oscrat/model';
import type { OscratProductCreate } from '@oscrat/model';

/**
 * Hook to fetch and manage OSCRAT organization
 * @param teamId Team ID
 */
export function useOscratOrganization(teamId: string) {
  const {
    data: organization,
    isLoading: isFetchingSummary,
    isFetching: isRefetchingSummary,
    isError: isSummaryError,
    error: summaryError,
  } = useGetOrganizationSummary(teamId);

  const {
    data: organizationDetail,
    isLoading: isFetchingDetail,
    isFetching: isRefetchingDetail,
    isError: isDetailError,
    error: detailError,
  } = useGetOrganizationDetail(teamId);

  const createMutation = useCreateOrganization(teamId);
  const updateMutation = useUpdateOrganization(teamId);
  const createProjectMutation = useCreateProject(teamId);

  const createOrganization = async (data: OscratOrganizationCreate) => {
    return createMutation.mutateAsync(data);
  };

  const updateOrganization = async (data: OscratOrganizationUpdate) => {
    return updateMutation.mutateAsync(data);
  };

  const createProject = async (data: OscratProductCreate) => {
    return createProjectMutation.mutateAsync(data);
  };

  const isLoading =
    isFetchingSummary ||
    isFetchingDetail ||
    isRefetchingSummary ||
    isRefetchingDetail ||
    createMutation.isPending ||
    updateMutation.isPending ||
    createProjectMutation.isPending;

  const isError = isSummaryError || isDetailError;
  const error = summaryError || detailError;

  return {
    organization,
    organizationDetail,
    isLoading,
    isError,
    error,
    createOrganization,
    updateOrganization,
    createProject,
  };
}
