import { WorkerJob } from '@oscrat/model';
import { PrismaClient } from '@oscrat/model/server';
import type {
  FileImportSbomPayload,
  FileImportSbomResult,
} from '@oscrat/model/types/jobPayloads';
import {
  updateSbomReport,
  getProductVersionNames,
  generateSbomFilename,
} from '@oscrat/model/operations/sbomReport';
import { withTempDirectory } from '../utils/filesystem';
import { convertSbomToSyftJson, analyzeSBOM, SyftSBOM } from '../utils/sbom';
import { JobError, saveJobError } from '../utils/JobError';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';
import { translateError } from '../utils/errorTranslator';
import * as fs from 'fs';
import * as path from 'path';

export async function executeSbomImport(
  job: WorkerJob,
  prisma: PrismaClient,
  _workspaceRoot: string
): Promise<FileImportSbomResult> {
  console.log(`[SBOM Import] Starting job ${job.id}`);

  const payload = job.payload as unknown as FileImportSbomPayload;

  if (!payload.filename || !payload.fileData) {
    throw new JobError(
      ERROR_CODES.INVALID_JOB_PAYLOAD,
      'File data and filename are required in job payload'
    );
  }

  console.log(`[SBOM Import] Processing file: ${payload.filename}`);

  const fileBuffer = Buffer.from(payload.fileData, 'base64');
  console.log(`[SBOM Import] File size: ${fileBuffer.length} bytes`);

  return await withTempDirectory(`sbom-import-${job.id}`, async (tempDir) => {
    try {
      // Save and convert file
      console.log(`[SBOM Import] Converting SBOM to Syft JSON...`);
      const inputFilePath = path.join(tempDir, payload.filename);
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
      await updateSbomReport(prisma, {
        reportId,
        sbomData: sbomSummary,
        createdBy: job.triggeredByUserId,
        sbomFile: {
          filename,
          fileData: fileBuffer,
          mimeType: payload.mimeType || 'application/xml',
        },
      });

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
}
