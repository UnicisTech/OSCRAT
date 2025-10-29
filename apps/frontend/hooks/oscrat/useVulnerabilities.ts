import { useGetVulnerabilities } from '@/lib/api/hooks/oscrat/vulnerabilities';
import { useVulnerabilityCrud } from './useVulnerabilityCrud';

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

  const {
    createVulnerability,
    deleteVulnerability,
    isCreating,
    isDeleting,
  } = useVulnerabilityCrud(teamId, productId, versionId);

  const isLoading = isFetchingVulnerabilities || isCreating || isDeleting;

  return {
    vulnerabilities,
    isLoading,
    isError,
    error,
    createVulnerability,
    deleteVulnerability,
    isCreating,
    isDeleting,
  };
}
