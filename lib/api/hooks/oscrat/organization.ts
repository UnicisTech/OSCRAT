import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratOrganizationEndpoints } from '@/lib/api/endpoints/oscrat/organization';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type {
  OscratOrganizationCreate,
  OscratOrganizationUpdate,
} from '@/types/oscrat/organisation';

// Get organization summary
export function useGetOrganizationSummary(teamId: string) {
  return useQuery({
    queryKey: queryKeys.oscrat.organization.summary(teamId),
    queryFn: () => oscratOrganizationEndpoints.getOrganizationSummary(teamId),
  });
}

// Get organization detail
export function useGetOrganizationDetail(teamId: string) {
  return useQuery({
    queryKey: queryKeys.oscrat.organization.detail(teamId),
    queryFn: () => oscratOrganizationEndpoints.getOrganizationDetail(teamId),
  });
}

// Create organization
export function useCreateOrganization(teamId: string) {
  return useMutation({
    mutationFn: (data: OscratOrganizationCreate) =>
      oscratOrganizationEndpoints.createOrganization(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.summary(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.detail(teamId),
      });
    },
  });
}

// Update organization
export function useUpdateOrganization(teamId: string) {
  return useMutation({
    mutationFn: (data: OscratOrganizationUpdate) =>
      oscratOrganizationEndpoints.updateOrganization(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.summary(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.detail(teamId),
      });
    },
  });
}
