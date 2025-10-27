import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratIncidentEndpoints } from '@/lib/api/endpoints/oscrat/incidents';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { OscratIncidentCreate, OscratIncidentUpdate } from '@oscrat/model';

// List incidents
export function useGetIncidents(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const result = useQuery({
    queryKey: queryKeys.oscrat.projects.versions.incidents.all(
      teamId,
      versionId
    ),
    queryFn: () => {
      return oscratIncidentEndpoints.listIncidents(
        teamId,
        productId,
        versionId
      );
    },
    enabled: options?.enabled !== false,
  });

  return result;
}

// Get incident detail
export function useGetIncidentDetail(
  teamId: string,
  productId: string,
  versionId: string,
  incidentId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.incidents.detail(
      teamId,
      versionId,
      incidentId
    ),
    queryFn: () =>
      oscratIncidentEndpoints.getIncidentDetail(
        teamId,
        productId,
        versionId,
        incidentId
      ),
    enabled: options?.enabled !== false,
  });
}

// Create incident
export function useCreateIncident(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: OscratIncidentCreate) =>
      oscratIncidentEndpoints.createIncident(
        teamId,
        productId,
        versionId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.incidents.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it might include incident summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Update incident
export function useUpdateIncident(
  teamId: string,
  productId: string,
  versionId: string,
  incidentId: string
) {
  return useMutation({
    mutationFn: (data: OscratIncidentUpdate) =>
      oscratIncidentEndpoints.updateIncident(
        teamId,
        productId,
        versionId,
        incidentId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.incidents.all(
          teamId,
          versionId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.incidents.detail(
          teamId,
          versionId,
          incidentId
        ),
      });
      // Also invalidate version detail since it might include incident summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Delete incident
export function useDeleteIncident(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (incidentId: string) =>
      oscratIncidentEndpoints.deleteIncident(
        teamId,
        productId,
        versionId,
        incidentId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.incidents.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it might include incident summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}
