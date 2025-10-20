import { WorkerJob } from '@oscrat/model';
import { PrismaClient } from '@oscrat/model/server';
import type {
  RepoGenerateSbomPayload,
  RepoGenerateSbomResult,
} from '@oscrat/model/types/jobPayloads';
import type { OscratRepositoryWithRelations } from '@oscrat/model/types/repository';
import { getRepositoryById } from '@oscrat/model/operations/repository';
import {
  updateSbomReport,
  getProductVersionNames,
  generateSbomFilename,
} from '@oscrat/model/operations/sbomReport';
import { withTempDirectory } from '../utils/filesystem';
import { cloneRepository } from '../utils/git';
import { generateSbom, analyzeSBOM, SyftSBOM } from '../utils/sbom';
import { JobError, saveJobError } from '../utils/JobError';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';
import { translateError } from '../utils/errorTranslator';
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
    // Clone repository
    console.log(`[SBOM Job] Cloning repository ${repository.name}...`);
    let repoDir: string;
    try {
      repoDir = await cloneRepository(repository, tempDir);
    } catch (error) {
      const jobError = translateError(
        'SBOM Job',
        error,
        ERROR_CODES.SBOM_GENERATION_FAILED,
        'Repository operation failed'
      );
      throw jobError;
    }

    // Generate SBOM
    console.log(`[SBOM Job] Generating SBOM files...`);
    const { syftJsonPath, cycloneDxXmlPath } = await generateSbom(repoDir);

    // Analyze SBOM
    console.log(`[SBOM Job] Analyzing SBOM data...`);
    const cycloneDxXmlData = fs.readFileSync(cycloneDxXmlPath);
    const syftJsonData = fs.readFileSync(syftJsonPath);
    const syftJsonContent = JSON.parse(syftJsonData.toString()) as SyftSBOM;

    const sbomSummary = analyzeSBOM(syftJsonContent);
    const packageCount = sbomSummary.overview.totalComponents;
    console.log(`[SBOM Job] Found ${packageCount} packages`);

    // Create report
    console.log(`[SBOM Job] Creating SBOM report...`);
    const names = await getProductVersionNames(
      prisma,
      repository.version.id
    );

    const filename = names
      ? generateSbomFilename(names.productName, names.versionName)
      : path.basename(cycloneDxXmlPath);

    // Get report ID from payload (injected during job creation)
    const payload = job.payload as unknown as RepoGenerateSbomPayload;
    const reportId = payload.reportId;

    // Update the existing report with data (status comes from job)
    await updateSbomReport(prisma, {
      reportId,
      sbomData: sbomSummary,
      createdBy: job.triggeredByUserId,
      sbomFile: {
        filename,
        fileData: cycloneDxXmlData,
        mimeType: 'application/xml',
      },
    });

    console.log(`[SBOM Job] Completed successfully. Report ID: ${reportId}`);

    return {
      repositoryId: repository.id,
      sbomData: reportId,
      generatedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error(`[SBOM Job] Job ${job.id} failed:`, error);

    // Update the report to FAILED status
    try {
      const reportWithJob = await prisma.workerJob.findUnique({
        where: { id: job.id },
        include: { sbomReport: true },
      });

    } catch (updateError) {
      console.error(`[SBOM Job] Failed to update report status:`, updateError);
    }

    await saveJobError(error, job, prisma);
    throw error;
  }
}

export async function executeSbomGeneration(
  job: WorkerJob,
  prisma: PrismaClient,
  workspaceRoot: string
): Promise<RepoGenerateSbomResult | string> {
  console.log(`[SBOM Job] Starting job ${job.id}`);

  const payload = job.payload as unknown as RepoGenerateSbomPayload;

  if (!payload.repositoryId) {
    throw new JobError(
      ERROR_CODES.INVALID_JOB_PAYLOAD,
      'Repository ID is required in job payload'
    );
  }

  const repository = await getRepositoryById(prisma, payload.repositoryId);
  if (!repository) {
    throw new JobError(
      ERROR_CODES.INVALID_JOB_PAYLOAD,
      `Repository with ID ${payload.repositoryId} not found`
    );
  }

  console.log(`[SBOM Job] Processing: ${repository.name} (${repository.provider})`);

  return await withTempDirectory(
    `sbom-${job.id}`,
    (tempDir) => generateSbomForRepository(repository, job, tempDir, prisma)
  );
}
