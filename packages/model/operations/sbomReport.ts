import { PrismaClient, type Prisma } from '@prisma/client';
import { createAttachment, CreateAttachmentParams } from './attachment';

export interface CreateSbomReportParams {
  jobId: string;
  versionId: string;
  productId: string;
  sbomData: any;
  createdBy: string; // User ID who triggered the SBOM generation
  sbomFile: {
    filename: string;
    fileData: Buffer;
    mimeType?: string;
  };
}

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
  attachment: report.attachment ? {
    id: report.attachment.id,
    name: report.attachment.name,
    description: report.attachment.description ?? undefined,
    fileSize: report.attachment.fileSize,
    mimeType: report.attachment.mimeType ?? undefined,
  } : undefined,
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

/** Create a new SBOM report */
export const createSbomReport = async (
  prisma: PrismaClient,
  params: CreateSbomReportParams
): Promise<SbomReportSummary> => {
  console.log(`[SBOM Report Operations] Creating SBOM report:`, {
    jobId: params.jobId,
    versionId: params.versionId,
    productId: params.productId,
    filename: params.sbomFile.filename,
    fileSize: params.sbomFile.fileData.length,
  });

  const report = await prisma.$transaction(async (tx) => {
    // Create the SBOM report first
    const sbomReport = await tx.sbomReport.create({
      data: {
        jobId: params.jobId,
        versionId: params.versionId,
        productId: params.productId,
        sbomData: params.sbomData,
      },
    });

    // Create the attachment for the SBOM file
    await createAttachment(prisma, {
      name: params.sbomFile.filename,
      description: 'SBOM Report File',
      fileData: params.sbomFile.fileData,
      fileSize: params.sbomFile.fileData.length,
      mimeType: params.sbomFile.mimeType,
      sbomReportId: sbomReport.id,
      createdBy: params.createdBy,
    });

    // Fetch the complete report with attachment
    const completeReport = await tx.sbomReport.findUnique({
      where: { id: sbomReport.id },
      include: SBOM_REPORT_SUMMARY_INCLUDE,
    });

    if (!completeReport) {
      throw new Error(`SBOM report ${sbomReport.id} not found after creation`);
    }

    console.log(`[SBOM Report Operations] SBOM report created:`, {
      id: sbomReport.id,
      jobId: sbomReport.jobId,
      versionId: sbomReport.versionId,
      productId: sbomReport.productId,
    });

    return completeReport;
  });

  return transformToSbomReportSummary(report);
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

  return report ? transformToSbomReportSummary(report) : null;
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
    return null;
  }

  return {
    filename: report.attachment.name,
    fileData: Buffer.from(report.attachment.file.fileData),
    mimeType: report.attachment.mimeType ?? undefined,
  };
};
