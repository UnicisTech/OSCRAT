import type {
  RepoGenerateSbomPayload,
  FileImportSbomPayload,
  RepoScanVulnerabilitiesPayload,
  SbomReportScanVulnerabilitiesPayload,
  ProcessConfigurationScanPayload,
} from '../../schemas/jobPayloads';

export type {
  RepoGenerateSbomPayload,
  FileImportSbomPayload,
  RepoScanVulnerabilitiesPayload,
  SbomReportScanVulnerabilitiesPayload,
  ProcessConfigurationScanPayload,
};

export interface RepoGenerateSbomResult {
  repositoryId: string;
  sbomData: any;
  generatedAt: string;
  fileCount?: number;
  packageCount?: number;
  vulnerabilityCount?: number;
}

export interface FileImportSbomResult {
  sbomData: any;
  generatedAt: string;
  packageCount?: number;
  vulnerabilityCount?: number;
}

export interface RepoScanVulnerabilitiesResult {
  repositoryId: string;
  scanData: any;
  generatedAt: string;
  vulnerabilityCount?: number;
  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  lowCount?: number;
}

export interface SbomReportScanVulnerabilitiesResult {
  sbomReportId: string;
  scanData: any;
  generatedAt: string;
  vulnerabilityCount?: number;
  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  lowCount?: number;
}

export interface ProcessConfigurationScanResult {
  generatedAt: string;
  totalRules?: number;
  passCount?: number;
  failCount?: number;
  otherCount?: number;
  tasksCreated?: number;
}

export type WorkerJobPayload =
  | RepoGenerateSbomPayload
  | FileImportSbomPayload
  | RepoScanVulnerabilitiesPayload
  | SbomReportScanVulnerabilitiesPayload
  | ProcessConfigurationScanPayload;

export type WorkerJobResult =
  | RepoGenerateSbomResult
  | FileImportSbomResult
  | RepoScanVulnerabilitiesResult
  | SbomReportScanVulnerabilitiesResult
  | ProcessConfigurationScanResult;
