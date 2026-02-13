import { PrismaClient, Prisma, WorkerJobStatus, WorkerJobType } from '@prisma/client';
import { format } from 'date-fns';
import { randomUUID } from 'crypto';
import { createAttachmentWithTx } from './attachment';
import { slugify } from '../utils/slugify';
import { SbomSource, createWorkerJobWithTx } from './workerJob';
import { createAuditContextWithTx, logCreate, logDelete, EntityType, CrudType, type AuditInfo } from '../audit';

export interface SbomReportSummary {
  id: string;
  jobId: string;
  versionId: string;
  productId: string;
  sbomData: any;
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

/** Report-centric aggregated type for SBOM reports */
export interface SbomReportDetails {
  id: string;
  versionId: string;
  productId: string;
  status: WorkerJobStatus;
  sbomData: any | null;
  createdAt: Date;
  updatedAt: Date;

  job: {
    id: string;
    source: SbomSource;
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

  latestVulnerabilityScan?: {
    id: string;
    status: WorkerJobStatus;
  };
}

/** Include for SBOM report summary queries */
const SBOM_REPORT_SUMMARY_INCLUDE = {
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

/** Include for SBOM report details queries */
const SBOM_REPORT_DETAILS_INCLUDE = {
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
  vulnerabilityScans: {
    select: {
      id: true,
      job: {
        select: {
          status: true,
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
    take: 1,
  },
} as const;

/** Transform Prisma SBOM report to SbomReportSummary */
const transformToSbomReportSummary = (
  report: Prisma.SbomReportGetPayload<{
    include: typeof SBOM_REPORT_SUMMARY_INCLUDE;
  }>
): SbomReportSummary => ({
  id: report.id,
  jobId: report.jobId,
  versionId: report.versionId,
  productId: report.productId,
  sbomData: report.sbomData,
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

/** Transform Prisma SBOM report to SbomReportDetails */
const transformToSbomReportDetails = (
  report: Prisma.SbomReportGetPayload<{
    include: typeof SBOM_REPORT_DETAILS_INCLUDE;
  }>
): SbomReportDetails => {
  const source = report.job.type === WorkerJobType.REPO_GENERATE_SBOM ? SbomSource.REPO : SbomSource.FILE;
  const latestScan = report.vulnerabilityScans?.[0];

  return {
    id: report.id,
    versionId: report.versionId,
    productId: report.productId,
    status: report.job.status,
    sbomData: report.sbomData,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    job: {
      id: report.job.id,
      source,
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
    latestVulnerabilityScan: latestScan
      ? {
          id: latestScan.id,
          status: latestScan.job.status,
        }
      : undefined,
  };
};

/** Get SBOM reports for a specific product */
export const getSbomReportsByProductId = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  limit: number = 50
): Promise<SbomReportSummary[]> => {
  console.log(`[SBOM Report Operations] Getting SBOM reports for product:`, {
    teamId,
    productId,
    limit,
  });

  const reports = await prisma.sbomReport.findMany({
    where: {
      productId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: SBOM_REPORT_SUMMARY_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  console.log(
    `[SBOM Report Operations] Found ${reports.length} SBOM reports for product ${productId}`
  );

  return reports.map(transformToSbomReportSummary);
};

/** Get SBOM report by ID */
export const getSbomReportById = async (
  prisma: PrismaClient,
  teamId: string,
  reportId: string
): Promise<SbomReportSummary | null> => {
  console.log(`[SBOM Report Operations] Getting SBOM report by ID:`, {
    teamId,
    reportId,
  });

  const report = await prisma.sbomReport.findFirst({
    where: {
      id: reportId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: SBOM_REPORT_SUMMARY_INCLUDE,
  });

  if (!report) {
    throw new Error(`SBOM report ${reportId} not found or not accessible`);
  }

  return transformToSbomReportSummary(report);
};

/** Get SBOM report file data */
export const getSbomReportFile = async (
  prisma: PrismaClient,
  teamId: string,
  reportId: string
): Promise<{
  filename: string;
  fileData: Buffer;
  mimeType?: string;
} | null> => {
  console.log(`[SBOM Report Operations] Getting SBOM report file:`, {
    teamId,
    reportId,
  });

  const report = await prisma.sbomReport.findFirst({
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
      `[SBOM Report Operations] SBOM report not found or not accessible: ${reportId}`
    );
    throw new Error(`SBOM report ${reportId} not found or not accessible`);
  }

  return {
    filename: report.attachment.name,
    fileData: Buffer.from(report.attachment.file.fileData),
    mimeType: report.attachment.mimeType ?? undefined,
  };
};

/** Get product and version names for SBOM filename generation */
export const getProductVersionNames = async (
  prisma: PrismaClient,
  versionId: string
): Promise<{ productName: string; versionName: string } | null> => {
  const version = await prisma.oscratProductVersion.findUnique({
    where: { id: versionId },
    include: {
      product: {
        select: { name: true },
      },
    },
  });

  if (!version) {
    throw new Error(`Version ${versionId} not found`);
  }

  return {
    productName: version.product.name,
    versionName: version.version,
  };
};

/** Generate standardized SBOM filename */
export const generateSbomFilename = (
  productName: string,
  versionName: string
): string => {
  // Clean timestamp format: YYYYMMDD-HHmmss
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');

  return `sbom-${slugify(productName)}-${slugify(versionName)}-${timestamp}.cyclonedx.xml`;
};

/** Create SBOM report with job (report-first approach) */
export interface CreateSbomReportWithJobParams {
  versionId: string;
  productId: string;
  jobType: 'REPO_GENERATE_SBOM' | 'FILE_IMPORT_SBOM';
  jobPayload: any;
  triggeredByUserId: string;
  teamId: string;
}

export const createSbomReportWithJob = async (
  prisma: PrismaClient,
  params: CreateSbomReportWithJobParams,
  auditInfo: AuditInfo
): Promise<SbomReportDetails> => {
  console.log(`[SBOM Report Operations] Creating SBOM report with job:`, {
    versionId: params.versionId,
    productId: params.productId,
    jobType: params.jobType,
    triggeredByUserId: params.triggeredByUserId,
  });

  const result = await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    // 1. Pre-generate the report ID
    const reportId = randomUUID();

    // 2. Create job using helper with reportId in payload
    const job = await createWorkerJobWithTx(tx, {
      type: params.jobType,
      triggeredByUserId: params.triggeredByUserId,
      contextTeamId: params.teamId,
      contextProductId: params.productId,
      contextVersionId: params.versionId,
      payload: {
        ...params.jobPayload,
        reportId, // Inject reportId into payload
      },
    });

    // 3. Create report with pre-generated ID
    const sbomReport = await tx.sbomReport.create({
      data: {
        id: reportId, // Use pre-generated ID
        jobId: job.id,
        versionId: params.versionId,
        productId: params.productId,
        sbomData: Prisma.JsonNull,
      },
    });

    const completeReport = await tx.sbomReport.findUnique({
      where: { id: sbomReport.id },
      include: SBOM_REPORT_DETAILS_INCLUDE,
    });

    if (!completeReport) {
      throw new Error(`SBOM report ${sbomReport.id} not found after creation`);
    }

    const action = params.jobType === 'REPO_GENERATE_SBOM' ? 'sbomreport.generate' : 'sbomreport.import';
    await audit.log({
      action,
      crud: CrudType.Create,
      user: audit.user,
      team: audit.team,
      target: { id: completeReport.id, name: completeReport.attachment?.name || completeReport.id, type: EntityType.SbomReport },
      productId: audit.productId,
      versionId: audit.versionId,
      metadata: { snapshot: JSON.stringify({ id: completeReport.id }) },
    });

    console.log(`[SBOM Report Operations] Created SBOM report and job:`, {
      reportId: completeReport.id,
      jobId: job.id,
      status: completeReport.job.status,
    });

    return completeReport;
  });

  return transformToSbomReportDetails(result);
};

/** Get SBOM reports with details for a version */
export const getSbomReportsWithDetails = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  limit: number = 50
): Promise<SbomReportDetails[]> => {
  console.log(`[SBOM Report Operations] Getting SBOM reports with details:`, {
    teamId,
    versionId,
    limit,
  });

  const reports = await prisma.sbomReport.findMany({
    where: {
      versionId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: SBOM_REPORT_DETAILS_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  console.log(
    `[SBOM Report Operations] Found ${reports.length} SBOM reports with details`
  );

  return reports.map(transformToSbomReportDetails);
};

/** Get SBOM report with details by ID */
export const getSbomReportDetailsById = async (
  prisma: PrismaClient,
  teamId: string,
  reportId: string
): Promise<SbomReportDetails | null> => {
  console.log(`[SBOM Report Operations] Getting SBOM report details by ID:`, {
    teamId,
    reportId,
  });

  const report = await prisma.sbomReport.findFirst({
    where: {
      id: reportId,
      version: {
        product: {
          teamId,
        },
      },
    },
    include: SBOM_REPORT_DETAILS_INCLUDE,
  });

  if (!report) {
    console.log(
      `[SBOM Report Operations] SBOM report not found or not accessible: ${reportId}`
    );
    return null;
  }

  return transformToSbomReportDetails(report);
};

/** Update SBOM report (used by job runner when job completes) */
export interface UpdateSbomReportParams {
  reportId: string;
  sbomData?: any;
  sbomFile?: {
    filename: string;
    fileData: Buffer;
    mimeType?: string;
  };
  createdBy: string;
}

export const updateSbomReport = async (
  prisma: PrismaClient,
  params: UpdateSbomReportParams
): Promise<void> => {
  console.log(`[SBOM Report Operations] Updating SBOM report:`, {
    reportId: params.reportId,
    hasSbomData: !!params.sbomData,
    hasSbomFile: !!params.sbomFile,
  });

  await prisma.$transaction(async (tx) => {
    await tx.sbomReport.update({
      where: { id: params.reportId },
      data: {
        sbomData: params.sbomData ?? null,
      },
    });

    if (params.sbomFile) {
      await createAttachmentWithTx(tx, {
        name: params.sbomFile.filename,
        description: 'SBOM Report File',
        fileData: params.sbomFile.fileData,
        fileSize: params.sbomFile.fileData.length,
        mimeType: params.sbomFile.mimeType,
        sbomReportId: params.reportId,
        createdBy: params.createdBy,
      });
    }
  });

  console.log(`[SBOM Report Operations] SBOM report updated successfully:`, {
    reportId: params.reportId,
  });
};

/** Delete SBOM report by ID */
export const deleteSbomReport = async (
  prisma: PrismaClient,
  teamId: string,
  reportId: string,
  auditInfo: AuditInfo
): Promise<void> => {
  console.log(`[SBOM Report Operations] Deleting SBOM report:`, {
    teamId,
    reportId,
  });

  await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const report = await tx.sbomReport.findFirst({
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
          select: { name: true },
        },
      },
    });

    if (!report) {
      throw new Error(
        `SBOM report ${reportId} not found or not accessible for team ${teamId}`
      );
    }

    await logDelete(EntityType.SbomReport, audit, { id: report.id, name: report.attachment?.name || report.id });

    await tx.sbomReport.delete({
      where: { id: reportId },
    });
  });

  console.log(
    `[SBOM Report Operations] Successfully deleted SBOM report ${reportId}`
  );
};
