import { WorkerJob } from '@oscrat/model';
import { PrismaClient } from '@oscrat/model/server';
import type { RepoGenerateSbomResult } from '@oscrat/model/types/jobPayloads';
import type { OscratRepositoryWithRelations } from '@oscrat/model/types/repository';
import { getRepositoryById } from '@oscrat/model/operations/repository';
import {
  updateSbomReport,
  getProductVersionNames,
  generateSbomFilename,
} from '@oscrat/model/operations/sbomReport';
import type { AuditInfo } from '@oscrat/model/audit';
import { repoGenerateSbomPayloadSchema } from '@oscrat/model/schemas/jobPayloads';
import { withTempDirectory } from '../utils/filesystem';
import { cloneRepository } from '../utils/git';
import { generateSbom, analyzeSBOM, SyftSBOM } from '../utils/sbom';
import { JobError, saveJobError } from '../utils/JobError';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';
import { translateError } from '../utils/errorTranslator';
import { validatePayload } from '../utils/validatePayload';
import { $ } from 'zx';
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

export async function generateLockFileIfNeeded(repoDir: string): Promise<void> {
  const packageJsonPath = path.join(repoDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  console.log(`[SBOM Job] Found package.json`);

  const lockFiles = [
    'package-lock.json',  // npm
    'yarn.lock',          // yarn
    'pnpm-lock.yaml',     // pnpm
    'bun.lockb',          // bun
  ];

  const hasLockFile = lockFiles.some(lockFile =>
    fs.existsSync(path.join(repoDir, lockFile))
  );

  if (hasLockFile) {
    console.log(`[SBOM Job] Lock file already exists, skipping generation`);
    return;
  }

  console.log(`[SBOM Job] No lock file found, generating package-lock.json...`);
  const $$ = $({ cwd: repoDir });
  try {
    await $$`npm install --package-lock-only`;
    console.log(`[SBOM Job] Successfully generated package-lock.json`);
  } catch (error) {
    console.warn(`[SBOM Job] Failed to generate lock file, continuing anyway:`, error);
  }
}

async function generateSbomForRepository(
  repository: OscratRepositoryWithRelations,
  job: WorkerJob,
  tempDir: string,
  prisma: PrismaClient,
  reportId: string
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

    await generateLockFileIfNeeded(repoDir);

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

    // Update the existing report with data (status comes from job)
    const auditInfo: AuditInfo | undefined = job.contextTeamId
      ? {
          user: { id: job.triggeredByUserId },
          team: { id: job.contextTeamId },
          productId: job.contextProductId ?? undefined,
          versionId: job.contextVersionId ?? undefined,
        }
      : undefined;
    await updateSbomReport(
      prisma,
      {
        reportId,
        sbomData: sbomSummary,
        createdBy: job.triggeredByUserId,
        sbomFile: {
          filename,
          fileData: cycloneDxXmlData,
          mimeType: 'application/xml',
        },
      },
      auditInfo
    );

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

  const payload = await validatePayload(repoGenerateSbomPayloadSchema, job.payload);

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
    (tempDir) => generateSbomForRepository(repository, job, tempDir, prisma, payload.reportId)
  );
}
