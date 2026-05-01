import { ConfigurationScanFormat, WorkerJob } from '@oscrat/model';
import { PrismaClient } from '@oscrat/model/server';
import type { ProcessConfigurationScanResult } from '@oscrat/model/types/jobPayloads';
import {
  updateConfigurationScanReport,
  getProductVersionNames,
  generateConfigurationScanFilename,
  getFileById,
  deleteFile,
} from '@oscrat/model/operations';
import { processConfigurationScanPayloadSchema } from '@oscrat/model/schemas/jobPayloads';
import { withTempDirectory } from '../utils/filesystem';
import {
  processWithOscapReport,
  parseScanReport,
  parseOvalResults,
} from '../utils/configurationScanner';
import { renderOvalHtmlReport } from '../utils/ovalHtmlReport';
import type { ConfigurationScanSummary } from '@oscrat/model/types/configurationScan';
import { validatePayload } from '../utils/validatePayload';
import { saveJobError } from '../utils/JobError';
import * as fs from 'fs';
import * as path from 'path';
import { gunzipSync } from 'zlib';

export async function executeConfigurationScan(
  job: WorkerJob,
  prisma: PrismaClient,
  _workspaceRoot: string
): Promise<ProcessConfigurationScanResult> {
  console.log(`[Configuration Scan] Starting job ${job.id}`);

  const payload = await validatePayload(processConfigurationScanPayloadSchema, job.payload);

  console.log(`[Configuration Scan] Processing file: ${payload.filename}`);

  const inputFile = await getFileById(prisma, payload.fileId);
  if (!inputFile) {
    throw new Error(`Input file ${payload.fileId} not found for configuration scan job ${job.id}`);
  }
  const fileBuffer = gunzipSync(inputFile.fileData);
  console.log(
    `[Configuration Scan] File size: ${fileBuffer.length} bytes (gunzipped from ${inputFile.fileData.length})`
  );

  try {
    return await withTempDirectory(`config-scan-${job.id}`, async (tempDir) => {
      try {
        const inputFilePath = path.join(tempDir, payload.filename);
        fs.writeFileSync(inputFilePath, fileBuffer);

        const isOval = payload.format === ConfigurationScanFormat.OVAL;

        console.log(`[Configuration Scan] Parsing scan report (format=${payload.format})...`);
        const scanSummary: ConfigurationScanSummary = isOval
          ? await parseOvalResults(inputFilePath)
          : await parseScanReport(inputFilePath, tempDir);
        console.log(
          `[Configuration Scan] Found ${scanSummary.totalRules} rules: ${scanSummary.passCount} pass, ${scanSummary.failCount} fail, ${scanSummary.errorCount} error`
        );

        // oscap-report only renders XCCDF/ARF; for OVAL we render a self-
        // contained HTML report from the parsed summary.
        console.log(`[Configuration Scan] Generating HTML report...`);
        const htmlReportData = isOval
          ? Buffer.from(renderOvalHtmlReport(scanSummary), 'utf-8')
          : fs.readFileSync(
              (await processWithOscapReport(inputFilePath, tempDir)).htmlReportPath
            );

        const names = await getProductVersionNames(prisma, job.contextVersionId!);
        const filename = names
          ? generateConfigurationScanFilename(names.productName, names.versionName)
          : `config-scan-${job.id}.html`;

        const htmlReportFile = {
          filename,
          fileData: htmlReportData,
          mimeType: 'text/html',
        };

        const reportId = payload.reportId;
        await updateConfigurationScanReport(prisma, {
          reportId,
          scanData: scanSummary,
          createdBy: job.triggeredByUserId,
          htmlReportFile,
        });

        console.log(`[Configuration Scan] Completed successfully. Report ID: ${reportId}`);

        return {
          generatedAt: new Date().toISOString(),
          totalRules: scanSummary.totalRules,
          passCount: scanSummary.passCount,
          failCount: scanSummary.failCount,
          otherCount: scanSummary.errorCount + scanSummary.notApplicableCount + scanSummary.notCheckedCount + scanSummary.otherCount,
        };
      } catch (error) {
        console.error(`[Configuration Scan] Job ${job.id} failed:`, error);
        await saveJobError(error, job, prisma);
        throw error;
      }
    });
  } finally {
    // Remove the input File row regardless of outcome to avoid orphans.
    await deleteFile(prisma, payload.fileId).catch((err) => {
      console.warn(
        `[Configuration Scan] Failed to delete input file ${payload.fileId}:`,
        err
      );
    });
  }
}
