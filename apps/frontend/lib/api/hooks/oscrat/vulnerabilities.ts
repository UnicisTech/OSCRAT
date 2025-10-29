import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratVulnerabilityEndpoints } from '@/lib/api/endpoints/oscrat/vulnerabilities';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { OscratVulnerabilityCreate, OscratVulnerabilityUpdate } from '@oscrat/model';

export function useGetVulnerabilities(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const result = useQuery({
    queryKey: queryKeys.oscrat.projects.versions.vulnerabilities.all(
      teamId,
      versionId
    ),
    queryFn: () => {
      return oscratVulnerabilityEndpoints.listVulnerabilities(
        teamId,
        productId,
        versionId
      );
    },
    enabled: options?.enabled !== false,
  });

  return result;
}

export function useGetVulnerabilityDetail(
  teamId: string,
  productId: string,
  versionId: string,
  vulnerabilityId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.vulnerabilities.detail(
      teamId,
      versionId,
      vulnerabilityId
    ),
    queryFn: () =>
      oscratVulnerabilityEndpoints.getVulnerabilityDetail(
        teamId,
        productId,
        versionId,
        vulnerabilityId
      ),
    enabled: options?.enabled !== false,
  });
}

export function useCreateVulnerability(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: OscratVulnerabilityCreate) =>
      oscratVulnerabilityEndpoints.createVulnerability(
        teamId,
        productId,
        versionId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.vulnerabilities.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it might include vulnerability summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

export function useUpdateVulnerability(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: ({ vulnerabilityId, data }: { vulnerabilityId: string; data: OscratVulnerabilityUpdate }) =>
      oscratVulnerabilityEndpoints.updateVulnerability(
        teamId,
        productId,
        versionId,
        vulnerabilityId,
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.vulnerabilities.all(
          teamId,
          versionId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.vulnerabilities.detail(
          teamId,
          versionId,
          variables.vulnerabilityId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

export function useDeleteVulnerability(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (vulnerabilityId: string) =>
      oscratVulnerabilityEndpoints.deleteVulnerability(
        teamId,
        productId,
        versionId,
        vulnerabilityId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.vulnerabilities.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it might include vulnerability summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}
