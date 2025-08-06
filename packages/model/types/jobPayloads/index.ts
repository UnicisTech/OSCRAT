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

export type WorkerJobPayload = RepoGenerateSbomPayload;

export type WorkerJobResult = RepoGenerateSbomResult;
