import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  oscratJobEndpoints,
  CreateSbomJobRequest,
  CreateVulnerabilityScanJobRequest,
  CreateSbomReportScanJobRequest,
} from '@/lib/api/endpoints/oscrat/jobs';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import { invalidateProductCountCaches } from './invalidations';
import { WorkerJobType } from '@oscrat/model';

// List SBOM reports
export function useGetSbomReports(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.jobs.sbom.all(
      teamId,
      versionId
    ),
    queryFn: () =>
      oscratJobEndpoints.listSbomReports(teamId, productId, versionId),
    enabled,
  });
}

export function useGetSbomReportDetail(
  teamId: string,
  productId: string,
  versionId: string,
  reportId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.jobs.sbom.detail(
      teamId,
      versionId,
      reportId
    ),
    queryFn: () =>
      oscratJobEndpoints.getSbomReportDetail(
        teamId,
        productId,
        versionId,
        reportId
      ),
    enabled,
  });
}

// Create repository-based SBOM report
export function useCreateRepoSbomReport(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: CreateSbomJobRequest) =>
      oscratJobEndpoints.createRepoSbomReport(
        teamId,
        productId,
        versionId,
        data
      ),
    onSuccess: () => {
      // Invalidate SBOM-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.sbom.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include report info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Create file-based SBOM report
export function useCreateFileSbomReport(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (formData: FormData) =>
      oscratJobEndpoints.createFileSbomReport(
        teamId,
        productId,
        versionId,
        formData
      ),
    onSuccess: () => {
      // Invalidate SBOM-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.sbom.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include report info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Delete SBOM report
export function useDeleteSbomReport(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (reportId: string) =>
      oscratJobEndpoints.deleteSbomReport(
        teamId,
        productId,
        versionId,
        reportId
      ),
    onSuccess: () => {
      // Invalidate SBOM-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.sbom.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include report info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Invalidate SBOM reports query
export function useInvalidateSbomReports() {
  const queryClient = useQueryClient();

  return (teamId: string, versionId: string) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.oscrat.projects.versions.jobs.sbom.all(
        teamId,
        versionId
      ),
    });
  };
}

// ============================================
// Vulnerability Scan Reports
// ============================================

// List vulnerability scan reports
export function useGetVulnerabilityScanReports(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.jobs.vulnerabilityScan.all(
      teamId,
      versionId
    ),
    queryFn: () =>
      oscratJobEndpoints.listVulnerabilityScanReports(
        teamId,
        productId,
        versionId
      ),
    enabled,
  });
}

export function useGetVulnerabilityScanReportDetail(
  teamId: string,
  productId: string,
  versionId: string,
  reportId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.jobs.vulnerabilityScan.detail(
      teamId,
      versionId,
      reportId
    ),
    queryFn: () =>
      oscratJobEndpoints.getVulnerabilityScanReportDetail(
        teamId,
        productId,
        versionId,
        reportId
      ),
    enabled,
  });
}

// Create repository-based vulnerability scan report
export function useCreateRepoVulnerabilityScanReport(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: CreateVulnerabilityScanJobRequest) =>
      oscratJobEndpoints.createRepoVulnerabilityScanReport(
        teamId,
        productId,
        versionId,
        data
      ),
    onSuccess: () => {
      // Invalidate vulnerability scan queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.vulnerabilityScan.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include report info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Create SBOM report-based vulnerability scan report
export function useCreateSbomReportVulnerabilityScan(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: CreateSbomReportScanJobRequest) =>
      oscratJobEndpoints.createSbomReportVulnerabilityScan(
        teamId,
        productId,
        versionId,
        data
      ),
    onSuccess: () => {
      // Invalidate vulnerability scan queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.vulnerabilityScan.all(
          teamId,
          versionId
        ),
      });
      // Invalidate SBOM queries (to update vulnerability scan status)
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.sbom.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include report info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Delete vulnerability scan report
export function useDeleteVulnerabilityScanReport(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (reportId: string) =>
      oscratJobEndpoints.deleteVulnerabilityScanReport(
        teamId,
        productId,
        versionId,
        reportId
      ),
    onSuccess: () => {
      // Invalidate vulnerability scan queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.vulnerabilityScan.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include report info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Invalidate vulnerability scan reports query
export function useInvalidateVulnerabilityScanReports() {
  const queryClient = useQueryClient();

  return (teamId: string, versionId: string) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.oscrat.projects.versions.jobs.vulnerabilityScan.all(
        teamId,
        versionId
      ),
    });
  };
}

// ============================================
// Configuration Scan Reports
// ============================================

// List configuration scan reports
export function useGetConfigurationScanReports(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.jobs.configurationScan.all(
      teamId,
      versionId
    ),
    queryFn: () =>
      oscratJobEndpoints.listConfigurationScanReports(
        teamId,
        productId,
        versionId
      ),
    enabled,
  });
}

export function useGetConfigurationScanReportDetail(
  teamId: string,
  productId: string,
  versionId: string,
  reportId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.jobs.configurationScan.detail(
      teamId,
      versionId,
      reportId
    ),
    queryFn: () =>
      oscratJobEndpoints.getConfigurationScanReportDetail(
        teamId,
        productId,
        versionId,
        reportId
      ),
    enabled,
  });
}

// Create file-based configuration scan report
export function useCreateFileConfigurationScanReport(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (formData: FormData) =>
      oscratJobEndpoints.createFileConfigurationScanReport(
        teamId,
        productId,
        versionId,
        formData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.configurationScan.all(
          teamId,
          versionId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Delete configuration scan report
export function useDeleteConfigurationScanReport(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (reportId: string) =>
      oscratJobEndpoints.deleteConfigurationScanReport(
        teamId,
        productId,
        versionId,
        reportId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.configurationScan.all(
          teamId,
          versionId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

export function useInvalidateConfigurationScanReports() {
  const queryClient = useQueryClient();

  return (teamId: string, productId: string, versionId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.teams.tasks.all(teamId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
    });
    invalidateProductCountCaches(teamId, productId);
    return queryClient.invalidateQueries({
      queryKey: queryKeys.oscrat.projects.versions.jobs.configurationScan.all(
        teamId,
        versionId
      ),
    });
  };
}
