import { useMemo } from 'react';
import {
  useGetIncidents,
  useGetIncidentDetail,
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
} from '@/lib/api/hooks/oscrat/incidents';
import type { OscratIncidentCreate, OscratIncidentUpdate } from '@oscrat/model';
import { OPEN_INCIDENT_STATUSES, IncidentStatus } from '@oscrat/model';

/**
 * Hook to fetch and manage incidents for a version
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID
 * @param incidentId Optional incident ID for detail operations
 */

const OPEN_STATUSES = OPEN_INCIDENT_STATUSES as readonly IncidentStatus[];

export function useIncidents(
  teamId: string,
  productId: string,
  versionId: string,
  incidentId?: string
) {
  const {
    data: incidents,
    isLoading: isFetchingIncidents,
    isError: isListError,
    error: listError,
  } = useGetIncidents(teamId, productId, versionId);

  const {
    data: incident,
    isLoading: isFetchingIncident,
    isError: isDetailError,
    error: detailError,
  } = useGetIncidentDetail(teamId, productId, versionId, incidentId || '', {
    enabled: !!incidentId,
  });

  const createIncidentMutation = useCreateIncident(
    teamId,
    productId,
    versionId
  );
  const updateIncidentMutation = useUpdateIncident(
    teamId,
    productId,
    versionId,
    incidentId || ''
  );
  const deleteIncidentMutation = useDeleteIncident(
    teamId,
    productId,
    versionId
  );

  const createIncident = async (data: OscratIncidentCreate) => {
    return createIncidentMutation.mutateAsync(data);
  };

  const updateIncident = async (data: OscratIncidentUpdate) => {
    if (!incidentId) {
      throw new Error('Incident ID required for update');
    }
    return updateIncidentMutation.mutateAsync(data);
  };

  const deleteIncident = async (idToDelete: string) => {
    return deleteIncidentMutation.mutateAsync(idToDelete);
  };

  const openCount = useMemo(() => {
    if (!incidents) return 0;
    return incidents.filter((i) => OPEN_STATUSES.includes(i.status)).length;
  }, [incidents]);

  const isLoading =
    isFetchingIncidents ||
    isFetchingIncident ||
    createIncidentMutation.isPending ||
    updateIncidentMutation.isPending ||
    deleteIncidentMutation.isPending;

  return {
    incidents: incidents ?? [],
    openCount,
    incident,
    isLoading,
    isListError,
    isDetailError,
    listError,
    detailError,
    createIncident,
    updateIncident,
    deleteIncident,
    isCreating: createIncidentMutation.isPending,
    isUpdating: updateIncidentMutation.isPending,
    isDeleting: deleteIncidentMutation.isPending,
  };
}
