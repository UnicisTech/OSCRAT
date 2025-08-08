import { PrismaClient, type Prisma } from '@prisma/client';
import { createFileInTransaction, getFileData, CreateFileParams } from './file';

export interface CreateSbomReportParams {
  jobId: string;
  versionId: string;
  productId: string;
  sbomData: any;
  sbomFile: CreateFileParams;
}

export interface SbomReportSummary {
  id: string;
  jobId: string;
  versionId: string;
  productId: string;
  sbomData: any;
  sbomFile: {
    id: string;
    filename: string;
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
  sbomFile: {
    select: {
      id: true,
      filename: true,
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
  sbomFile: {
    id: report.sbomFile.id,
    filename: report.sbomFile.filename,
    fileSize: report.sbomFile.fileSize,
    mimeType: report.sbomFile.mimeType ?? undefined,
  },
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
    fileSize: params.sbomFile.fileSize,
  });

  const report = await prisma.$transaction(async (tx) => {
    const file = await createFileInTransaction(tx, params.sbomFile);

    const sbomReport = await tx.sbomReport.create({
      data: {
        jobId: params.jobId,
        versionId: params.versionId,
        productId: params.productId,
        sbomData: params.sbomData,
        sbomFileId: file.id,
      },
      include: SBOM_REPORT_SUMMARY_INCLUDE,
    });

    console.log(`[SBOM Report Operations] SBOM report created:`, {
      id: sbomReport.id,
      jobId: sbomReport.jobId,
      versionId: sbomReport.versionId,
      productId: sbomReport.productId,
    });

    return sbomReport;
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
    select: {
      sbomFileId: true,
    },
  });

  if (!report) {
    console.log(
      `[SBOM Report Operations] SBOM report not found or not accessible: ${reportId}`
    );
    return null;
  }

  return await getFileData(prisma, report.sbomFileId);
};
