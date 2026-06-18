import { useMemo } from 'react';
import { useGetVulnerabilities } from '@/lib/api/hooks/oscrat/vulnerabilities';
import { useVulnerabilityCrud } from './useVulnerabilityCrud';
import {
  OPEN_VULNERABILITY_STATUSES,
  OscratProductVulnerabilityStatus,
} from '@oscrat/model';

const OPEN_STATUSES =
  OPEN_VULNERABILITY_STATUSES as readonly OscratProductVulnerabilityStatus[];

export function useVulnerabilities(
  teamId: string,
  productId: string,
  versionId: string
) {
  const {
    data: vulnerabilities,
    isLoading: isFetchingVulnerabilities,
    isError,
    error,
  } = useGetVulnerabilities(teamId, productId, versionId);

  const { createVulnerability, deleteVulnerability, isCreating, isDeleting } =
    useVulnerabilityCrud(teamId, productId, versionId);

  const openCount = useMemo(() => {
    if (!vulnerabilities) return 0;
    return vulnerabilities.filter((v) => OPEN_STATUSES.includes(v.status))
      .length;
  }, [vulnerabilities]);

  const isLoading = isFetchingVulnerabilities || isCreating || isDeleting;

  return {
    vulnerabilities: vulnerabilities ?? [],
    openCount,
    isLoading,
    isError,
    error,
    createVulnerability,
    deleteVulnerability,
    isCreating,
    isDeleting,
  };
}
