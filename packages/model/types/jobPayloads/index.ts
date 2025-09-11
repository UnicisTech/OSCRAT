export interface RepoGenerateSbomPayload {
  repositoryId: string;
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
  fileData: string; // base64 encoded file content
  mimeType: string;
}

export interface FileImportSbomResult {
  sbomData: any;
  generatedAt: string;
  packageCount?: number;
  vulnerabilityCount?: number;
}

export type WorkerJobPayload = RepoGenerateSbomPayload | FileImportSbomPayload;

export type WorkerJobResult = RepoGenerateSbomResult | FileImportSbomResult;
