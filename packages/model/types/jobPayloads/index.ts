export interface RepoGenerateSbomPayload {
  repositoryId: string;
  reportId: string; 
}

export interface RepoGenerateSbomResult {
  repositoryId: string;
  sbomData: any;
  generatedAt: string;
  fileCount?: number;
  packageCount?: number;
  vulnerabilityCount?: number;
}

export interface FileImportSbomPayload {
  filename: string;
  fileData: string; 
  mimeType: string;
  reportId: string;
}

export interface FileImportSbomResult {
  sbomData: any;
  generatedAt: string;
  packageCount?: number;
  vulnerabilityCount?: number;
}

export interface RepoScanVulnerabilitiesPayload {
  repositoryId: string;
  reportId: string; 
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

export interface SbomReportScanVulnerabilitiesPayload {
  sbomReportId: string;
  reportId: string; 
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

export type WorkerJobPayload =
  | RepoGenerateSbomPayload
  | FileImportSbomPayload
  | RepoScanVulnerabilitiesPayload
  | SbomReportScanVulnerabilitiesPayload;

export type WorkerJobResult =
  | RepoGenerateSbomResult
  | FileImportSbomResult
  | RepoScanVulnerabilitiesResult
  | SbomReportScanVulnerabilitiesResult;
