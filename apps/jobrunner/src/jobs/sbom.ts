import { WorkerJob } from '@oscrat/model';
import { PrismaClient } from '@oscrat/model/server';
import type {
  RepoGenerateSbomPayload,
  RepoGenerateSbomResult,
} from '@oscrat/model/types/jobPayloads';
import type { OscratRepositoryWithRelations } from '@oscrat/model/types/repository';
import { getRepositoryById } from '@oscrat/model/operations/repository';
import { createSbomReport } from '@oscrat/model/operations/sbomReport';
import { withTempDirectory } from '../utils/filesystem';
import { cloneRepository } from '../utils/git';
import { generateSbom, analyzeSBOM, SyftSBOM } from '../utils/sbom';
import * as fs from 'fs';
import * as path from 'path';

async function simulateSbomGeneration(
  repository: OscratRepositoryWithRelations,
  job: WorkerJob,
  tempDir: string
): Promise<RepoGenerateSbomResult> {
  console.log(
    `[SBOM Simulation] Starting simulation for repository: ${repository.name}`
  );
  console.log(`[SBOM Simulation] Job ID: ${job.id}`);
  console.log(`[SBOM Simulation] Temp directory: ${tempDir}`);
  console.log(`[SBOM Simulation] Repository URL: ${repository.repositoryUrl}`);
  console.log(`[SBOM Simulation] Provider: ${repository.provider}`);

  // Simulate processing time
  console.log(`[SBOM Simulation] Simulating SBOM generation work...`);
  await new Promise((resolve) => setTimeout(resolve, 15 * 1000));

  console.log(`[SBOM Simulation] Simulation completed`);

  return {
    repositoryId: repository.id,
    sbomData: {
      status: 'completed',
      message: `SBOM simulation completed for repository ${repository.name}`,
      repositoryUrl: repository.repositoryUrl,
      repoDir: tempDir, // Use temp dir since we're not actually cloning
    },
    generatedAt: new Date().toISOString(),
    fileCount: 128,
    packageCount: 45,
    vulnerabilityCount: 3,
  };
}

async function generateSbomForRepository(
  repository: OscratRepositoryWithRelations,
  job: WorkerJob,
  tempDir: string,
  prisma: PrismaClient
): Promise<RepoGenerateSbomResult> {
  try {
    console.log(`[SBOM Job] Cloning repository...`);
    const repoDir = await cloneRepository(repository, tempDir);

    console.log(`[SBOM Job] Generating SBOM files...`);
    const { syftJsonPath, cycloneDxXmlPath } = await generateSbom(repoDir);

    // Read the generated SBOM files
    console.log(`[SBOM Job] Reading SBOM files...`);
    const cycloneDxXmlData = fs.readFileSync(cycloneDxXmlPath);

    // create summary from syft json
    const syftJsonData = fs.readFileSync(syftJsonPath);
    const syftJsonContent = JSON.parse(syftJsonData.toString());
    const sbomSummary = analyzeSBOM(syftJsonContent as SyftSBOM);
    const packageCount = sbomSummary.overview.totalComponents;

    console.log(`[SBOM Job] Creating SBOM report...`);

    // Create single SBOM report with JSON data and CycloneDX XML file
    const sbomReport = await createSbomReport(prisma, {
      jobId: job.id,
      versionId: repository.version.id,
      productId: repository.version.product.id,
      sbomData: sbomSummary,
      sbomFile: {
        filename: path.basename(cycloneDxXmlPath),
        fileData: cycloneDxXmlData,
        fileSize: cycloneDxXmlData.length,
        mimeType: 'application/xml',
      },
    });

    const result: RepoGenerateSbomResult = {
      repositoryId: repository.id,
      sbomData: sbomReport.id,
      generatedAt: new Date().toISOString(),
    };

    console.log(
      `[SBOM Job] Completed: ${packageCount} packages, created report ${sbomReport.id}`
    );
    return result;
  } catch (error: any) {
    console.error(`[SBOM Job] Failed:`, {
      error: error.message,
      repository: repository.name,
      jobId: job.id,
    });
    throw error;
  }
}

export async function executeSbomGeneration(
  job: WorkerJob,
  prisma: PrismaClient,
  workspaceRoot: string
): Promise<RepoGenerateSbomResult | string> {
  console.log(
    `[SBOM Job] Starting job ${job.id} (workspace: ${workspaceRoot})`
  );

  // Parse the job payload
  const payload = job.payload as unknown as RepoGenerateSbomPayload;

  if (!payload.repositoryId) {
    console.error(`[SBOM Job] Missing repository ID in payload`);
    throw new Error('Repository ID is required in job payload');
  }

  console.log(`[SBOM Job] Fetching repository ${payload.repositoryId}`);

  // Get repository details from database
  const repository = await getRepositoryById(prisma, payload.repositoryId);

  if (!repository) {
    console.error(`[SBOM Job] Repository ${payload.repositoryId} not found`);
    throw new Error(`Repository with ID ${payload.repositoryId} not found`);
  }

  console.log(
    `[SBOM Job] Found repository: ${repository.name} (${repository.provider})`
  );

  return await withTempDirectory(
    `sbom-${job.id}`,
    (
      tempDir //simulateSbomGeneration(repository, job, tempDir)
    ) => generateSbomForRepository(repository, job, tempDir, prisma)
  );
}
