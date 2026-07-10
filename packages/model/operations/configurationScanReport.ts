import {
  PrismaClient,
  Prisma,
  WorkerJobStatus,
  ConfigurationScanFormat,
} from '@prisma/client';
import { format } from 'date-fns';
import { randomUUID } from 'crypto';
import { gzipSync } from 'zlib';
import { createAttachmentWithTx } from './attachment';
import { createFileInTransaction } from './file';
import { slugify } from '../utils/slugify';
import { fromJson, toJsonInput } from '../utils/json';
import { createWorkerJobWithTx } from './workerJob';
import {
  createAuditContextWithTx,
  logCreate,
  logDelete,
  CrudType,
  EntityType,
  type AuditInfo,
} from '../audit';
import { getConfigurationTasksByVersion } from './task';
import type {
  ConfigurationScanRuleResult,
  ConfigurationScanSummary,
} from '../types/configurationScan';

export interface ConfigurationScanReportSummary {
  id: string;
  jobId: string;
  versionId: string;
  productId: string;
  format: ConfigurationScanFormat;
  formatVersion: string;
  scanData: ConfigurationScanSummary | null;
  attachment?: {
    id: string;
    name: string;
    description?: string;
    fileSize: number;
    mimeType?: string;
  };
  job: {
    id: string;
    type: string;
    status: string;
    createdAt: Date;
    processStartTime?: Date;
    processEndTime?: Date;
  };
  createdAt: Date;
}

export interface ConfigurationScanReportDetails {
  id: string;
  versionId: string;
  productId: string;
  format: ConfigurationScanFormat;
  formatVersion: string;
  status: WorkerJobStatus;
  scanData: ConfigurationScanSummary | null;
  createdAt: Date;
  updatedAt: Date;

  job: {
    id: string;
    status: WorkerJobStatus;
    createdAt: Date;
    processStartTime?: Date;
    processEndTime?: Date;
    errCode?: string;
    errMessage?: string;
    triggeredByUser: {
      id: string;
      name: string | null;
      email: string;
    };
  };

  attachment?: {
    id: string;
    name: string;
    description?: string;
    fileSize: number;
    mimeType?: string;
  };
}

/** Include for configuration scan report summary queries */
const CONFIGURATION_SCAN_REPORT_SUMMARY_INCLUDE = {
  job: {
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      processStartTime: true,
      processEndTime: true,
    },
  },
  attachment: {
    select: {
      id: true,
      name: true,
      description: true,
      fileSize: true,
      mimeType: true,
    },
  },
} as const;

/** Include for configuration scan report details queries */
const CONFIGURATION_SCAN_REPORT_DETAILS_INCLUDE = {
  job: {
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      processStartTime: true,
      processEndTime: true,
      errCode: true,
      errMessage: true,
      triggeredByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  attachment: {
    select: {
      id: true,
      name: true,
      description: true,
      fileSize: true,
      mimeType: true,
    },
  },
} as const;

/** Transform Prisma configuration scan report to ConfigurationScanReportSummary */
const transformToConfigurationScanReportSummary = (
  report: Prisma.ConfigurationScanReportGetPayload<{
    include: typeof CONFIGURATION_SCAN_REPORT_SUMMARY_INCLUDE;
  }>
): ConfigurationScanReportSummary => ({
  id: report.id,
  jobId: report.jobId,
  versionId: report.versionId,
  productId: report.productId,
  format: report.format,
  formatVersion: report.formatVersion,
  scanData: fromJson<ConfigurationScanSummary>(report.scanData),
  attachment: report.attachment
    ? {
        id: report.attachment.id,
        name: report.attachment.name,
        description: report.attachment.description ?? undefined,
        fileSize: report.attachment.fileSize,
        mimeType: report.attachment.mimeType ?? undefined,
      }
    : undefined,
  job: {
    id: report.job.id,
    type: report.job.type,
    status: report.job.status,
    createdAt: report.job.createdAt,
    processStartTime: report.job.processStartTime ?? undefined,
    processEndTime: report.job.processEndTime ?? undefined,
  },
  createdAt: report.createdAt,
});

/** Transform Prisma configuration scan report to ConfigurationScanReportDetails */
const transformToConfigurationScanReportDetails = (
  report: Prisma.ConfigurationScanReportGetPayload<{
    include: typeof CONFIGURATION_SCAN_REPORT_DETAILS_INCLUDE;
  }>
): ConfigurationScanReportDetails => ({
  id: report.id,
  versionId: report.versionId,
  productId: report.productId,
  format: report.format,
  formatVersion: report.formatVersion,
  status: report.job.status,
  scanData: fromJson<ConfigurationScanSummary>(report.scanData),
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
  job: {
    id: report.job.id,
    status: report.job.status,
    createdAt: report.job.createdAt,
    processStartTime: report.job.processStartTime ?? undefined,
    processEndTime: report.job.processEndTime ?? undefined,
    errCode: report.job.errCode ?? undefined,
    errMessage: report.job.errMessage ?? undefined,
    triggeredByUser: {
      id: report.job.triggeredByUser.id,
      name: report.job.triggeredByUser.name,
      email: report.job.triggeredByUser.email,
    },
  },
  attachment: report.attachment
    ? {
        id: report.attachment.id,
        name: report.attachment.name,
        description: report.attachment.description ?? undefined,
        fileSize: report.attachment.fileSize,
        mimeType: report.attachment.mimeType ?? undefined,
      }
    : undefined,
});

/** Get configuration scan reports for a specific version */
export const getConfigurationScanReportsByVersionId = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  limit: number = 50
): Promise<ConfigurationScanReportSummary[]> => {
  console.log(
    `[Configuration Scan Report Operations] Getting configuration scan reports for version:`,
    {
      teamId,
      versionId,
      limit,
    }
  );

  const reports = await prisma.configurationScanReport.findMany({
    where: {
      versionId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: CONFIGURATION_SCAN_REPORT_SUMMARY_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  console.log(
    `[Configuration Scan Report Operations] Found ${reports.length} configuration scan reports for version ${versionId}`
  );

  return reports.map(transformToConfigurationScanReportSummary);
};

/** Get configuration scan report by ID */
export const getConfigurationScanReportById = async (
  prisma: PrismaClient,
  teamId: string,
  reportId: string
): Promise<ConfigurationScanReportSummary | null> => {
  console.log(
    `[Configuration Scan Report Operations] Getting configuration scan report by ID:`,
    {
      teamId,
      reportId,
    }
  );

  const report = await prisma.configurationScanReport.findFirst({
    where: {
      id: reportId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: CONFIGURATION_SCAN_REPORT_SUMMARY_INCLUDE,
  });

  if (!report) {
    return null;
  }

  return transformToConfigurationScanReportSummary(report);
};

/** Get configuration scan report file data */
export const getConfigurationScanReportFile = async (
  prisma: PrismaClient,
  teamId: string,
  reportId: string
): Promise<{
  filename: string;
  fileData: Buffer;
  mimeType?: string;
} | null> => {
  console.log(
    `[Configuration Scan Report Operations] Getting configuration scan report file:`,
    {
      teamId,
      reportId,
    }
  );

  const report = await prisma.configurationScanReport.findFirst({
    where: {
      id: reportId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: {
      attachment: {
        include: {
          file: true,
        },
      },
    },
  });

  if (!report || !report.attachment) {
    console.log(
      `[Configuration Scan Report Operations] Configuration scan report not found or has no attachment: ${reportId}`
    );
    return null;
  }

  return {
    filename: report.attachment.name,
    fileData: Buffer.from(report.attachment.file.fileData),
    mimeType: report.attachment.mimeType ?? undefined,
  };
};

/** Get configuration scan reports with details for a version */
export const getConfigurationScanReportsWithDetails = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<ConfigurationScanReportDetails[]> => {
  console.log(
    `[Configuration Scan Report Operations] Getting configuration scan reports with details:`,
    {
      teamId,
      versionId,
    }
  );

  const reports = await prisma.configurationScanReport.findMany({
    where: {
      versionId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: CONFIGURATION_SCAN_REPORT_DETAILS_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

  console.log(
    `[Configuration Scan Report Operations] Found ${reports.length} configuration scan reports with details`
  );

  return reports.map(transformToConfigurationScanReportDetails);
};

/** Get configuration scan report with details by ID */
export const getConfigurationScanReportDetailsById = async (
  prisma: PrismaClient,
  teamId: string,
  reportId: string
): Promise<ConfigurationScanReportDetails | null> => {
  console.log(
    `[Configuration Scan Report Operations] Getting configuration scan report details by ID:`,
    {
      teamId,
      reportId,
    }
  );

  const report = await prisma.configurationScanReport.findFirst({
    where: {
      id: reportId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: CONFIGURATION_SCAN_REPORT_DETAILS_INCLUDE,
  });

  if (!report) {
    console.log(
      `[Configuration Scan Report Operations] Configuration scan report not found or not accessible: ${reportId}`
    );
    return null;
  }

  const transformed = transformToConfigurationScanReportDetails(report);

  if (transformed.scanData?.rules?.length) {
    const tasksByRule = await getConfigurationTasksByVersion(
      prisma,
      teamId,
      report.versionId
    );
    if (tasksByRule.size > 0) {
      transformed.scanData.rules = transformed.scanData.rules.map(
        (rule: ConfigurationScanRuleResult) => ({
          ...rule,
          existingTask: tasksByRule.get(rule.ruleId),
        })
      );
    }
  }

  return transformed;
};

/** Generate standardized configuration scan filename */
export const generateConfigurationScanFilename = (
  productName: string,
  versionName: string
): string => {
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');

  return `config-scan-${slugify(productName)}-${slugify(versionName)}-${timestamp}.html`;
};

/** Create configuration scan report with job (report-first approach) */
export interface CreateConfigurationScanReportWithJobParams {
  versionId: string;
  productId: string;
  format: ConfigurationScanFormat;
  formatVersion: string;
  fileData: Buffer;
  filename: string;
  mimeType: string;
  triggeredByUserId: string;
  teamId: string;
}

export const createConfigurationScanReportWithJob = async (
  prisma: PrismaClient,
  params: CreateConfigurationScanReportWithJobParams,
  auditInfo: AuditInfo
): Promise<ConfigurationScanReportDetails> => {
  console.log(
    `[Configuration Scan Report Operations] Creating configuration scan report with job:`,
    {
      versionId: params.versionId,
      productId: params.productId,
      triggeredByUserId: params.triggeredByUserId,
      fileSize: params.fileData.length,
    }
  );

  // gzip outside the transaction to keep CPU work off the DB session.
  const compressed = gzipSync(params.fileData);
  console.log(
    `[Configuration Scan Report Operations] gzip: ${params.fileData.length} -> ${compressed.length} bytes`
  );

  const result = await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    // 1. Pre-generate the report ID
    const reportId = randomUUID();

    // 2. Persist the gzipped bytes in the File table; only the small fileId
    //    travels through the WorkerJob payload. Worker gunzips on read.
    const inputFile = await createFileInTransaction(tx, {
      fileData: compressed,
      fileSize: compressed.length,
      mimeType: 'application/gzip',
    });

    // 3. Create job with reportId + fileId reference
    const job = await createWorkerJobWithTx(tx, {
      type: 'PROCESS_CONFIGURATION_SCAN',
      triggeredByUserId: params.triggeredByUserId,
      contextTeamId: params.teamId,
      contextProductId: params.productId,
      contextVersionId: params.versionId,
      payload: {
        reportId,
        fileId: inputFile.id,
        filename: params.filename,
        mimeType: params.mimeType,
        format: params.format,
      },
    });

    // 4. Create report with pre-generated ID
    const configurationScanReport = await tx.configurationScanReport.create({
      data: {
        id: reportId,
        jobId: job.id,
        versionId: params.versionId,
        productId: params.productId,
        format: params.format,
        formatVersion: params.formatVersion,
        scanData: Prisma.JsonNull,
      },
    });

    const completeReport = await tx.configurationScanReport.findUnique({
      where: { id: configurationScanReport.id },
      include: CONFIGURATION_SCAN_REPORT_DETAILS_INCLUDE,
    });

    if (!completeReport) {
      throw new Error(
        `Configuration scan report ${configurationScanReport.id} not found after creation`
      );
    }

    await logCreate(EntityType.ConfigurationScanReport, audit, {
      id: completeReport.id,
    });

    console.log(
      `[Configuration Scan Report Operations] Created configuration scan report and job:`,
      {
        reportId: completeReport.id,
        jobId: job.id,
        status: completeReport.job.status,
      }
    );

    return completeReport;
  });

  return transformToConfigurationScanReportDetails(result);
};

/** Update configuration scan report (used by job runner when job completes) */
export interface UpdateConfigurationScanReportParams {
  reportId: string;
  scanData?: ConfigurationScanSummary;
  htmlReportFile?: {
    filename: string;
    fileData: Buffer;
    mimeType?: string;
  };
  createdBy: string;
}

export const updateConfigurationScanReport = async (
  prisma: PrismaClient,
  params: UpdateConfigurationScanReportParams,
  auditInfo?: AuditInfo
): Promise<void> => {
  console.log(
    `[Configuration Scan Report Operations] Updating configuration scan report:`,
    {
      reportId: params.reportId,
      hasScanData: !!params.scanData,
      hasHtmlReportFile: !!params.htmlReportFile,
    }
  );

  await prisma.$transaction(async (tx) => {
    const report = await tx.configurationScanReport.update({
      where: { id: params.reportId },
      data: {
        scanData: toJsonInput(params.scanData),
      },
      select: { versionId: true },
    });

    if (params.htmlReportFile) {
      await createAttachmentWithTx(tx, {
        name: params.htmlReportFile.filename,
        description: 'Configuration Scan HTML Report',
        fileData: params.htmlReportFile.fileData,
        fileSize: params.htmlReportFile.fileData.length,
        mimeType: params.htmlReportFile.mimeType,
        configurationScanReportId: params.reportId,
        versionId: report.versionId,
        createdBy: params.createdBy,
      });
    }

    if (auditInfo) {
      const audit = createAuditContextWithTx(tx, auditInfo);
      await audit.log({
        action: 'configurationscanreport.process',
        crud: CrudType.Update,
        user: audit.user,
        team: audit.team,
        target: {
          id: params.reportId,
          name: params.reportId,
          type: EntityType.ConfigurationScanReport,
        },
        productId: audit.productId,
        versionId: audit.versionId,
        metadata: params.htmlReportFile
          ? { outputFilename: params.htmlReportFile.filename }
          : {},
      });
    }
  });

  console.log(
    `[Configuration Scan Report Operations] Configuration scan report updated successfully:`,
    {
      reportId: params.reportId,
    }
  );
};

/** Delete configuration scan report by ID */
export const deleteConfigurationScanReport = async (
  prisma: PrismaClient,
  teamId: string,
  reportId: string,
  auditInfo: AuditInfo
): Promise<void> => {
  console.log(
    `[Configuration Scan Report Operations] Deleting configuration scan report:`,
    {
      teamId,
      reportId,
    }
  );

  await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const report = await tx.configurationScanReport.findFirst({
      where: {
        id: reportId,
        version: {
          product: {
            teamId,
          },
        },
      },
      select: { id: true, versionId: true, productId: true },
    });

    if (!report) {
      throw new Error(
        `Configuration scan report ${reportId} not found or not accessible for team ${teamId}`
      );
    }

    await logDelete(EntityType.ConfigurationScanReport, audit, report);

    await tx.configurationScanReport.delete({
      where: { id: reportId },
    });
  });

  console.log(
    `[Configuration Scan Report Operations] Successfully deleted configuration scan report ${reportId}`
  );
};
