import { api } from '@/lib/api/client';
import {
  SbomReportDetails,
  VulnerabilityScanReportDetails,
} from '@oscrat/model/operations';

export interface CreateSbomJobRequest {
  repositoryId: string;
}

export interface CreateVulnerabilityScanJobRequest {
  repositoryId: string;
}

export interface CreateSbomReportScanJobRequest {
  sbomReportId: string;
}

export const oscratJobEndpoints = {
  // SBOM Reports - GET all reports, POST to create from repository
  listSbomReports: (teamId: string, productId: string, versionId: string) =>
    api.get<SbomReportDetails[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/sbom-reports`
    ),

  // Create repository-based SBOM report (POST to main endpoint)
  createRepoSbomReport: (
    teamId: string,
    productId: string,
    versionId: string,
    data: CreateSbomJobRequest
  ) =>
    api.post<SbomReportDetails>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/sbom-reports`,
      data
    ),

  // Create file-based SBOM report (POST to /import endpoint)
  createFileSbomReport: (
    teamId: string,
    productId: string,
    versionId: string,
    formData: FormData
  ) =>
    api.post<SbomReportDetails>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/sbom-reports/import`,
      formData,
      { headers: { 'Content-Type': undefined } }
    ),

  // Get SBOM report details by reportId
  getSbomReportDetail: (
    teamId: string,
    productId: string,
    versionId: string,
    reportId: string
  ) =>
    api.get<SbomReportDetails>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/sbom-reports/${reportId}`
    ),

  // Delete SBOM report by reportId
  deleteSbomReport: (
    teamId: string,
    productId: string,
    versionId: string,
    reportId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/sbom-reports/${reportId}`
    ),

  // Vulnerability Scan Reports - GET all reports, POST to create from repository
  listVulnerabilityScanReports: (
    teamId: string,
    productId: string,
    versionId: string
  ) =>
    api.get<VulnerabilityScanReportDetails[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerability-scan-reports`
    ),

  // Create repository-based vulnerability scan report (POST to main endpoint)
  createRepoVulnerabilityScanReport: (
    teamId: string,
    productId: string,
    versionId: string,
    data: CreateVulnerabilityScanJobRequest
  ) =>
    api.post<VulnerabilityScanReportDetails>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerability-scan-reports`,
      data
    ),

  // Create SBOM report-based vulnerability scan (POST to /scan-sbom endpoint)
  createSbomReportVulnerabilityScan: (
    teamId: string,
    productId: string,
    versionId: string,
    data: CreateSbomReportScanJobRequest
  ) =>
    api.post<VulnerabilityScanReportDetails>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerability-scan-reports/scan-sbom`,
      data
    ),

  // Get vulnerability scan report details by reportId
  getVulnerabilityScanReportDetail: (
    teamId: string,
    productId: string,
    versionId: string,
    reportId: string
  ) =>
    api.get<VulnerabilityScanReportDetails>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerability-scan-reports/${reportId}`
    ),

  // Delete vulnerability scan report by reportId
  deleteVulnerabilityScanReport: (
    teamId: string,
    productId: string,
    versionId: string,
    reportId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerability-scan-reports/${reportId}`
    ),
};
