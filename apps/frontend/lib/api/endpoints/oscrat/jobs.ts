import { api } from '@/lib/api/client';
import {
  SbomReportDetails,
  VulnerabilityScanReportDetails,
  ConfigurationScanReportDetails,
} from '@oscrat/model/operations';
import { versionApiPath } from './urls';

export interface CreateSbomJobRequest {
  repositoryId: string;
}

export interface CreateVulnerabilityScanJobRequest {
  repositoryId: string;
}

export interface CreateSbomReportScanJobRequest {
  sbomReportId: string;
}

const sbomReports = (teamId: string, productId: string, versionId: string) =>
  `${versionApiPath(teamId, productId, versionId)}/sbom-reports`;

const vulnerabilityScanReports = (
  teamId: string,
  productId: string,
  versionId: string
) =>
  `${versionApiPath(teamId, productId, versionId)}/vulnerability-scan-reports`;

const configurationScanReports = (
  teamId: string,
  productId: string,
  versionId: string
) =>
  `${versionApiPath(teamId, productId, versionId)}/configuration-scan-reports`;

export const oscratJobEndpoints = {
  // SBOM Reports - GET all reports, POST to create from repository
  listSbomReports: (teamId: string, productId: string, versionId: string) =>
    api.get<SbomReportDetails[]>(sbomReports(teamId, productId, versionId)),

  // Create repository-based SBOM report (POST to main endpoint)
  createRepoSbomReport: (
    teamId: string,
    productId: string,
    versionId: string,
    data: CreateSbomJobRequest
  ) =>
    api.post<SbomReportDetails>(
      sbomReports(teamId, productId, versionId),
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
      `${sbomReports(teamId, productId, versionId)}/import`,
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
      `${sbomReports(teamId, productId, versionId)}/${reportId}`
    ),

  // Delete SBOM report by reportId
  deleteSbomReport: (
    teamId: string,
    productId: string,
    versionId: string,
    reportId: string
  ) =>
    api.delete<void>(
      `${sbomReports(teamId, productId, versionId)}/${reportId}`
    ),

  // Vulnerability Scan Reports - GET all reports, POST to create from repository
  listVulnerabilityScanReports: (
    teamId: string,
    productId: string,
    versionId: string
  ) =>
    api.get<VulnerabilityScanReportDetails[]>(
      vulnerabilityScanReports(teamId, productId, versionId)
    ),

  // Create repository-based vulnerability scan report (POST to main endpoint)
  createRepoVulnerabilityScanReport: (
    teamId: string,
    productId: string,
    versionId: string,
    data: CreateVulnerabilityScanJobRequest
  ) =>
    api.post<VulnerabilityScanReportDetails>(
      vulnerabilityScanReports(teamId, productId, versionId),
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
      `${vulnerabilityScanReports(teamId, productId, versionId)}/scan-sbom`,
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
      `${vulnerabilityScanReports(teamId, productId, versionId)}/${reportId}`
    ),

  // Delete vulnerability scan report by reportId
  deleteVulnerabilityScanReport: (
    teamId: string,
    productId: string,
    versionId: string,
    reportId: string
  ) =>
    api.delete<void>(
      `${vulnerabilityScanReports(teamId, productId, versionId)}/${reportId}`
    ),

  // Configuration Scan Reports - GET list, POST file import, GET/DELETE detail
  listConfigurationScanReports: (
    teamId: string,
    productId: string,
    versionId: string
  ) =>
    api.get<ConfigurationScanReportDetails[]>(
      configurationScanReports(teamId, productId, versionId)
    ),

  // Create file-based configuration scan report (POST to /import endpoint)
  createFileConfigurationScanReport: (
    teamId: string,
    productId: string,
    versionId: string,
    formData: FormData
  ) =>
    api.post<ConfigurationScanReportDetails>(
      `${configurationScanReports(teamId, productId, versionId)}/import`,
      formData,
      { headers: { 'Content-Type': undefined } }
    ),

  getConfigurationScanReportDetail: (
    teamId: string,
    productId: string,
    versionId: string,
    reportId: string
  ) =>
    api.get<ConfigurationScanReportDetails>(
      `${configurationScanReports(teamId, productId, versionId)}/${reportId}`
    ),

  deleteConfigurationScanReport: (
    teamId: string,
    productId: string,
    versionId: string,
    reportId: string
  ) =>
    api.delete<void>(
      `${configurationScanReports(teamId, productId, versionId)}/${reportId}`
    ),
};
