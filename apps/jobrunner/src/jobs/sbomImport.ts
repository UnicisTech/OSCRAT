import { WorkerJob } from '@oscrat/model';
import { PrismaClient } from '@oscrat/model/server';
import type {
  FileImportSbomPayload,
  FileImportSbomResult,
} from '@oscrat/model/types/jobPayloads';
import {
  createSbomReport,
  getProductVersionNames,
  generateSbomFilename,
} from '@oscrat/model/operations/sbomReport';
import { withTempDirectory } from '../utils/filesystem';
import { convertSbomToSyftJson, analyzeSBOM, SyftSBOM } from '../utils/sbom';
import * as fs from 'fs';
import * as path from 'path';

export async function executeSbomImport(
  job: WorkerJob,
  prisma: PrismaClient,
  workspaceRoot: string
): Promise<FileImportSbomResult> {
  console.log(
    `[SBOM Import Job] Starting job ${job.id} (workspace: ${workspaceRoot})`
  );

  // Parse the job payload
  const payload = job.payload as unknown as FileImportSbomPayload;

  if (!payload.filename || !payload.fileData) {
    console.error(`[SBOM Import Job] Missing file data in payload`);
    throw new Error('File data is required in job payload');
  }

  console.log(`[SBOM Import Job] Processing file: ${payload.filename}`);

  // Decode file data from base64
  const fileBuffer = Buffer.from(payload.fileData, 'base64');

  console.log(
    `[SBOM Import Job] File decoded: ${payload.filename} (${fileBuffer.length} bytes)`
  );

  return await withTempDirectory(`sbom-import-${job.id}`, async (tempDir) => {
    try {
      // Save the file data to temp directory
      const inputFilePath = path.join(tempDir, payload.filename);
      fs.writeFileSync(inputFilePath, fileBuffer);

      console.log(`[SBOM Import Job] Saved file to: ${inputFilePath}`);

      // Convert CycloneDX XML to Syft JSON format
      const syftJsonPath = path.join(tempDir, 'converted-sbom.syft.json');

      try {
        await convertSbomToSyftJson(inputFilePath, syftJsonPath);
        console.log(
          `[SBOM Import Job] Converted SBOM to Syft JSON: ${syftJsonPath}`
        );
      } catch (conversionError: any) {
        console.error(
          `[SBOM Import Job] Failed to convert SBOM:`,
          conversionError
        );
        throw new Error('Failed to convert SBOM file');
      }

      // Read and analyze the converted SBOM
      let syftJsonContent: SyftSBOM;
      let sbomSummary;
      let packageCount = 0;

      try {
        const syftJsonData = fs.readFileSync(syftJsonPath);
        syftJsonContent = JSON.parse(syftJsonData.toString()) as SyftSBOM;
        sbomSummary = analyzeSBOM(syftJsonContent);
        packageCount = sbomSummary.overview.totalComponents;
        console.log(
          `[SBOM Import Job] Analyzed SBOM: ${packageCount} packages found`
        );
      } catch (analysisError: any) {
        console.error(
          `[SBOM Import Job] Failed to analyze SBOM:`,
          analysisError
        );
        throw new Error('Failed to analyze SBOM file');
      }

      // Create SBOM report using the original file data
      // Get product and version names for proper filename
      const names = await getProductVersionNames(
        prisma,
        job.contextProductId!,
        job.contextVersionId!
      );

      const filename = names
        ? generateSbomFilename(names.productName, names.versionName)
        : `imported-sbom-${job.id}.cyclonedx.xml`; // fallback to previous behavior

      const sbomReport = await createSbomReport(prisma, {
        jobId: job.id,
        versionId: job.contextVersionId!,
        productId: job.contextProductId!,
        sbomData: sbomSummary,
        createdBy: job.triggeredByUserId,
        sbomFile: {
          filename,
          fileData: fileBuffer,
          mimeType: payload.mimeType || 'application/xml',
        },
      });

      const result: FileImportSbomResult = {
        sbomData: sbomReport.id,
        generatedAt: new Date().toISOString(),
        packageCount: packageCount,
      };

      console.log(
        `[SBOM Import Job] Completed: ${packageCount} packages, created report ${sbomReport.id}`
      );
      return result;
    } catch (error: any) {
      console.error(`[SBOM Import Job] Failed:`, {
        error: error.message,
        filename: payload.filename,
        jobId: job.id,
      });
      throw error;
    }
  });
}
