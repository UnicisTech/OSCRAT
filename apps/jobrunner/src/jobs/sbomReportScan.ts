import { WorkerJob } from '@oscrat/model';
import { PrismaClient } from '@oscrat/model/server';
import type {
  SbomReportScanVulnerabilitiesPayload,
  SbomReportScanVulnerabilitiesResult,
} from '@oscrat/model/types/jobPayloads';
import {
  getSbomReportFile,
  updateVulnerabilityScanReport,
  getProductVersionNames,
  generateVulnerabilityScanFilename,
} from '@oscrat/model/operations';
import { withTempDirectory } from '../utils/filesystem';
import {
  scanSbomFileWithGrype,
  analyzeGrypeResults,
  GrypeResult,
} from '../utils/vulnerabilityScanner';
import { JobError, saveJobError } from '../utils/JobError';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';
import * as fs from 'fs';
import * as path from 'path';

export async function executeSbomReportScan(
  job: WorkerJob,
  prisma: PrismaClient,
  _workspaceRoot: string
): Promise<SbomReportScanVulnerabilitiesResult> {
  console.log(`[SBOM Report Scan] Starting job ${job.id}`);

  const payload = job.payload as unknown as SbomReportScanVulnerabilitiesPayload;

  if (!payload.sbomReportId) {
    throw new JobError(
      ERROR_CODES.INVALID_JOB_PAYLOAD,
      'SBOM report ID is required in job payload'
    );
  }

  console.log(
    `[SBOM Report Scan] Scanning SBOM report: ${payload.sbomReportId}`
  );

  return await withTempDirectory(
    `sbom-report-scan-${job.id}`,
    async (tempDir) => {
      try {
        // Fetch SBOM file from existing report
        console.log(`[SBOM Report Scan] Fetching SBOM report file...`);
        const sbomFile = await getSbomReportFile(
          prisma,
          job.contextTeamId!,
          payload.sbomReportId
        );

        if (!sbomFile) {
          throw new JobError(
            ERROR_CODES.INVALID_JOB_PAYLOAD,
            `SBOM report ${payload.sbomReportId} not found or has no file`
          );
        }

        // Write SBOM file to temp directory
        const sbomFilePath = path.join(tempDir, sbomFile.filename);
        fs.writeFileSync(sbomFilePath, sbomFile.fileData as any);
        console.log(`[SBOM Report Scan] SBOM file written: ${sbomFilePath}`);

        // Scan with Grype
        console.log(`[SBOM Report Scan] Scanning with Grype...`);
        const { grypeJsonPath } = await scanSbomFileWithGrype(sbomFilePath);

        // Analyze Grype results
        console.log(`[SBOM Report Scan] Analyzing vulnerability scan data...`);
        const grypeJsonData = fs.readFileSync(grypeJsonPath);
        const grypeJsonContent = JSON.parse(
          grypeJsonData.toString()
        ) as GrypeResult;

        const scanSummary = analyzeGrypeResults(grypeJsonContent);
        const vulnerabilityCount = scanSummary.totalVulnerabilities;
        console.log(
          `[SBOM Report Scan] Found ${vulnerabilityCount} vulnerabilities`
        );
        console.log(
          `[SBOM Report Scan] Breakdown: ${scanSummary.criticalCount} Critical, ${scanSummary.highCount} High, ${scanSummary.mediumCount} Medium, ${scanSummary.lowCount} Low`
        );

        // Create report
        console.log(`[SBOM Report Scan] Creating vulnerability scan report...`);
        const names = await getProductVersionNames(
          prisma,
          job.contextVersionId!
        );

        const filename = names
          ? generateVulnerabilityScanFilename(
              names.productName,
              names.versionName
            )
          : `sbom-scan-${job.id}.grype.json`;

        // Get report ID from payload (injected during job creation)
        const reportId = payload.reportId;

        // Update the existing report with data (status comes from job)
        await updateVulnerabilityScanReport(prisma, {
          reportId,
          scanData: scanSummary,
          createdBy: job.triggeredByUserId,
          scanFile: {
            filename,
            fileData: grypeJsonData,
            mimeType: 'application/json',
          },
        });

        console.log(
          `[SBOM Report Scan] Completed successfully. Report ID: ${reportId}`
        );

        return {
          sbomReportId: payload.sbomReportId,
          scanData: reportId,
          generatedAt: new Date().toISOString(),
          vulnerabilityCount,
          criticalCount: scanSummary.criticalCount,
          highCount: scanSummary.highCount,
          mediumCount: scanSummary.mediumCount,
          lowCount: scanSummary.lowCount,
        };
      } catch (error) {
        console.error(`[SBOM Report Scan] Job ${job.id} failed:`, error);

        await saveJobError(error, job, prisma);
        throw error;
      }
    }
  );
}
