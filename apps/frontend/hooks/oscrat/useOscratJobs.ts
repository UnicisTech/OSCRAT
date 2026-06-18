import {
  useGetSbomReports,
  useCreateRepoSbomReport,
  useCreateFileSbomReport,
  useDeleteSbomReport,
  useInvalidateSbomReports,
  useGetVulnerabilityScanReports,
  useCreateRepoVulnerabilityScanReport,
  useCreateSbomReportVulnerabilityScan,
  useDeleteVulnerabilityScanReport,
  useInvalidateVulnerabilityScanReports,
  useGetConfigurationScanReports,
  useCreateFileConfigurationScanReport,
  useDeleteConfigurationScanReport,
  useInvalidateConfigurationScanReports,
} from '@/lib/api/hooks/oscrat/jobs';
import type {
  CreateSbomJobRequest,
  CreateVulnerabilityScanJobRequest,
  CreateSbomReportScanJobRequest,
} from '@/lib/api/endpoints/oscrat/jobs';
import type {
  SbomReportDetails,
  VulnerabilityScanReportDetails,
  ConfigurationScanReportDetails,
} from '@oscrat/model/operations';

/**
 * Hook for SBOM reports for a version (both REPO and FILE types)
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID
 * @param options Optional configuration to control queries
 */
export function useOscratVersionSbomReports(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  const {
    data: reports,
    isLoading: isFetchingReports,
    isError,
    error,
  } = useGetSbomReports(teamId, productId, versionId, { enabled });

  // Mutations for different report operations
  const createRepoSbomReportMutation = useCreateRepoSbomReport(
    teamId,
    productId,
    versionId
  );
  const createFileSbomReportMutation = useCreateFileSbomReport(
    teamId,
    productId,
    versionId
  );
  const deleteSbomReportMutation = useDeleteSbomReport(
    teamId,
    productId,
    versionId
  );
  const invalidateSbomReports = useInvalidateSbomReports();

  const createRepoSbomReport = async (data: CreateSbomJobRequest) => {
    return createRepoSbomReportMutation.mutateAsync(data);
  };

  const createFileSbomReport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return createFileSbomReportMutation.mutateAsync(formData);
  };

  const deleteSbomReport = async (reportId: string) => {
    return deleteSbomReportMutation.mutateAsync(reportId);
  };

  const refreshReports = () => {
    return invalidateSbomReports(teamId, versionId);
  };

  const isLoading =
    isFetchingReports ||
    createRepoSbomReportMutation.isPending ||
    createFileSbomReportMutation.isPending ||
    deleteSbomReportMutation.isPending;

  return {
    reports,
    isLoading,
    isError,
    error,
    createRepoSbomReport,
    createFileSbomReport,
    deleteSbomReport,
    refreshReports,
  };
}

/**
 * Hook for vulnerability scan reports for a version
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID
 * @param options Optional configuration to control queries
 */
export function useOscratVersionVulnerabilityScanReports(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  const {
    data: reports,
    isLoading: isFetchingReports,
    isError,
    error,
  } = useGetVulnerabilityScanReports(teamId, productId, versionId, { enabled });

  // Mutations for different report operations
  const createRepoVulnerabilityScanReportMutation =
    useCreateRepoVulnerabilityScanReport(teamId, productId, versionId);
  const createSbomReportVulnerabilityScanMutation =
    useCreateSbomReportVulnerabilityScan(teamId, productId, versionId);
  const deleteVulnerabilityScanReportMutation =
    useDeleteVulnerabilityScanReport(teamId, productId, versionId);
  const invalidateVulnerabilityScanReports =
    useInvalidateVulnerabilityScanReports();

  const createRepoVulnerabilityScanReport = async (
    data: CreateVulnerabilityScanJobRequest
  ) => {
    return createRepoVulnerabilityScanReportMutation.mutateAsync(data);
  };

  const createSbomReportVulnerabilityScan = async (
    data: CreateSbomReportScanJobRequest
  ) => {
    return createSbomReportVulnerabilityScanMutation.mutateAsync(data);
  };

  const deleteVulnerabilityScanReport = async (reportId: string) => {
    return deleteVulnerabilityScanReportMutation.mutateAsync(reportId);
  };

  const refreshReports = () => {
    return invalidateVulnerabilityScanReports(teamId, versionId);
  };

  const isLoading =
    isFetchingReports ||
    createRepoVulnerabilityScanReportMutation.isPending ||
    createSbomReportVulnerabilityScanMutation.isPending ||
    deleteVulnerabilityScanReportMutation.isPending;

  return {
    reports,
    isLoading,
    isError,
    error,
    createRepoVulnerabilityScanReport,
    createSbomReportVulnerabilityScan,
    deleteVulnerabilityScanReport,
    refreshReports,
  };
}

/**
 * Hook for configuration scan reports for a version (file-import only)
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID
 * @param options Optional configuration to control queries
 */
export function useOscratVersionConfigurationScanReports(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  const {
    data: reports,
    isLoading: isFetchingReports,
    isError,
    error,
  } = useGetConfigurationScanReports(teamId, productId, versionId, { enabled });

  const createFileConfigurationScanReportMutation =
    useCreateFileConfigurationScanReport(teamId, productId, versionId);
  const deleteConfigurationScanReportMutation =
    useDeleteConfigurationScanReport(teamId, productId, versionId);
  const invalidateConfigurationScanReports =
    useInvalidateConfigurationScanReports();

  const createFileConfigurationScanReport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return createFileConfigurationScanReportMutation.mutateAsync(formData);
  };

  const deleteConfigurationScanReport = async (reportId: string) => {
    return deleteConfigurationScanReportMutation.mutateAsync(reportId);
  };

  const refreshReports = () => {
    return invalidateConfigurationScanReports(teamId, versionId);
  };

  const isLoading =
    isFetchingReports ||
    createFileConfigurationScanReportMutation.isPending ||
    deleteConfigurationScanReportMutation.isPending;

  return {
    reports,
    isLoading,
    isError,
    error,
    createFileConfigurationScanReport,
    deleteConfigurationScanReport,
    refreshReports,
  };
}
