import { WorkerJob } from '@oscrat/model';
import { PrismaClient } from '@oscrat/model/server';
import type { FileImportSbomResult } from '@oscrat/model/types/jobPayloads';
import {
  updateSbomReport,
  getProductVersionNames,
  generateSbomFilename,
} from '@oscrat/model/operations/sbomReport';
import { getFileById, deleteFile } from '@oscrat/model/operations';
import type { AuditInfo } from '@oscrat/model/audit';
import { fileImportSbomPayloadSchema } from '@oscrat/model/schemas/jobPayloads';
import { withTempDirectory, resolveInTempDir } from '../utils/filesystem';
import { convertSbomToSyftJson, analyzeSBOM, SyftSBOM } from '../utils/sbom';
import { saveJobError } from '../utils/JobError';
import { validatePayload } from '../utils/validatePayload';
import * as fs from 'fs';
import * as path from 'path';
import { gunzipSync } from 'zlib';

export async function executeSbomImport(
  job: WorkerJob,
  prisma: PrismaClient,
  _workspaceRoot: string
): Promise<FileImportSbomResult> {
  console.log(`[SBOM Import] Starting job ${job.id}`);

  const payload = await validatePayload(fileImportSbomPayloadSchema, job.payload);

  console.log(`[SBOM Import] Processing file: ${payload.filename}`);

  const inputFile = await getFileById(prisma, payload.fileId);
  if (!inputFile) {
    throw new Error(`Input file ${payload.fileId} not found for SBOM import job ${job.id}`);
  }
  const fileBuffer = gunzipSync(inputFile.fileData);
  console.log(
    `[SBOM Import] File size: ${fileBuffer.length} bytes (gunzipped from ${inputFile.fileData.length})`
  );

  try {
    return await withTempDirectory(`sbom-import-${job.id}`, async (tempDir) => {
      try {
        // Save and convert file
        console.log(`[SBOM Import] Converting SBOM to Syft JSON...`);
        const inputFilePath = resolveInTempDir(tempDir, payload.filename);
        fs.writeFileSync(inputFilePath, fileBuffer as any);

        const syftJsonPath = path.join(tempDir, 'converted-sbom.syft.json');
        await convertSbomToSyftJson(inputFilePath, syftJsonPath);

        // Analyze SBOM
        console.log(`[SBOM Import] Analyzing SBOM data...`);
        const syftJsonData = fs.readFileSync(syftJsonPath);
        const syftJsonContent = JSON.parse(syftJsonData.toString()) as SyftSBOM;

        const sbomSummary = analyzeSBOM(syftJsonContent);
        const packageCount = sbomSummary.overview.totalComponents;
        console.log(`[SBOM Import] Found ${packageCount} packages`);

        // Create report
        console.log(`[SBOM Import] Creating SBOM report...`);
        const names = await getProductVersionNames(
          prisma,
          job.contextVersionId!
        );

        const filename = names
          ? generateSbomFilename(names.productName, names.versionName)
          : `imported-sbom-${job.id}.cyclonedx.xml`;

        // Get report ID from payload (injected during job creation)
        const reportId = payload.reportId;

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
              fileData: fileBuffer,
              mimeType: payload.mimeType || 'application/xml',
            },
          },
          auditInfo
        );

        console.log(`[SBOM Import] Completed successfully. Report ID: ${reportId}`);

        return {
          sbomData: reportId,
          generatedAt: new Date().toISOString(),
          packageCount: packageCount,
        };

      } catch (error) {
        console.error(`[SBOM Import] Job ${job.id} failed:`, error);

        // No need to update report on failure - status comes from job
        // Report will automatically show FAILED status based on job.status

        await saveJobError(error, job, prisma);
        throw error;
      }
    });
  } finally {
    // Remove the input File row regardless of outcome to avoid orphans.
    await deleteFile(prisma, payload.fileId).catch((err) => {
      console.warn(
        `[SBOM Import] Failed to delete input file ${payload.fileId}:`,
        err
      );
    });
  }
}
