import {
  PrismaClient,
  WorkerJobType,
  WorkerJobStatus,
  WorkerJob,
  Prisma,
} from '@prisma/client';

// Reusable select patterns
const USER_SELECT = {
  select: {
    id: true,
    name: true,
    email: true,
  },
} as const;

const REPOSITORY_SELECT = {
  id: true,
  name: true,
  repositoryUrl: true,
  provider: true,
} as const;

export interface FinishWorkerJobParams {
  jobId: string;
  success: boolean;
  result?: any;
  errorMessage?: string;
}

export interface CreateWorkerJobParams {
  type: WorkerJobType;
  triggeredByUserId: string;
  contextTeamId: string;
  contextProductId?: string;
  contextVersionId?: string;
  payload: any;
}

export enum SbomSource {
  REPO = 'REPO',
  FILE = 'FILE',
}

export enum VulnerabilityScanSource {
  REPO = 'REPO',
  SBOM_REPORT = 'SBOM_REPORT',
}

export interface SbomWorkerJob {
  id: string;
  status: WorkerJobStatus;
  source: SbomSource;
  createdAt: Date;
  processStartTime: Date | null;
  processEndTime: Date | null;
  errCode?: string;
  errMessage?: string;
  triggeredByUser: {
    id: string;
    name: string | null;
    email: string;
  };
  sbomData?: any;
  attachment?: {
    id: string;
    name: string;
    fileSize: number;
    mimeType?: string;
  };
}

export interface VulnerabilityScanWorkerJob {
  id: string;
  status: WorkerJobStatus;
  source: VulnerabilityScanSource;
  createdAt: Date;
  processStartTime: Date | null;
  processEndTime: Date | null;
  errCode?: string;
  errMessage?: string;
  triggeredByUser: {
    id: string;
    name: string | null;
    email: string;
  };
  scanData?: any;
  attachment?: {
    id: string;
    name: string;
    fileSize: number;
    mimeType?: string;
  };
}

/** Pop a pending worker job by type and set it to IN_PROGRESS */
export const popWorkerJob = async (
  prisma: PrismaClient,
  jobType?: WorkerJobType
): Promise<WorkerJob | null> => {
  console.log(`[Worker Job Operations] Popping worker job:`, {
    jobType: jobType || 'any',
    timestamp: new Date().toISOString(),
  });

  // Use a transaction to atomically find and update a pending job
  const job = await prisma.$transaction(async (tx) => {
    // Build where clause - optionally filter by job type
    const whereClause: Prisma.WorkerJobWhereInput = {
      status: WorkerJobStatus.PENDING,
    };

    if (jobType) {
      whereClause.type = jobType;
    }

    console.log(
      `[Worker Job Operations] Searching for pending jobs with criteria:`,
      whereClause
    );

    // Find the oldest pending job (optionally of the specified type)
    const pendingJob = await tx.workerJob.findFirst({
      where: whereClause,
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!pendingJob) {
      console.log(`[Worker Job Operations] No pending jobs found`);
      return null;
    }

    console.log(`[Worker Job Operations] Found pending job:`, {
      id: pendingJob.id,
      type: pendingJob.type,
      createdAt: pendingJob.createdAt,
      triggeredByUserId: pendingJob.triggeredByUserId,
    });

    // Update the job to IN_PROGRESS and set processStartTime
    const updatedJob = await tx.workerJob.update({
      where: {
        id: pendingJob.id,
      },
      data: {
        status: WorkerJobStatus.IN_PROGRESS,
        processStartTime: new Date(),
      },
    });

    console.log(`[Worker Job Operations] Job updated to IN_PROGRESS:`, {
      id: updatedJob.id,
      status: updatedJob.status,
      processStartTime: updatedJob.processStartTime,
    });

    return updatedJob;
  });

  return job;
};

/** Finish a worker job with success or failure outcome */
export const finishWorkerJob = async (
  prisma: PrismaClient,
  params: FinishWorkerJobParams
): Promise<void> => {
  const { jobId, success, result, errorMessage } = params;

  console.log(`[Worker Job Operations] Finishing job:`, {
    jobId,
    success,
    hasResult: !!result,
    errorMessage: errorMessage || 'none',
  });

  // Verify the job exists and is in progress
  const existingJob = await prisma.workerJob.findUnique({
    where: { id: jobId },
    select: { id: true, status: true },
  });

  if (!existingJob) {
    console.error(`[Worker Job Operations] Job not found: ${jobId}`);
    throw new Error(`Worker job ${jobId} not found`);
  }

  console.log(
    `[Worker Job Operations] Current job status: ${existingJob.status}`
  );

  if (existingJob.status !== WorkerJobStatus.IN_PROGRESS) {
    console.error(
      `[Worker Job Operations] Job ${jobId} is not in progress (current status: ${existingJob.status})`
    );
    throw new Error(
      `Worker job ${jobId} is not in progress (current status: ${existingJob.status})`
    );
  }

  // Update the job with completion details
  const updatedJob = await prisma.workerJob.update({
    where: { id: jobId },
    data: {
      status: success ? WorkerJobStatus.COMPLETED : WorkerJobStatus.FAILED,
      processEndTime: new Date(),
      result: success ? result : null,
      errMessage: success ? null : errorMessage,
    },
  });

  console.log(`[Worker Job Operations] Job finished:`, {
    id: updatedJob.id,
    status: updatedJob.status,
    processEndTime: updatedJob.processEndTime,
    success,
  });
};

/** Create a new worker job - base function for all job types */
export const createWorkerJob = async (
  prisma: PrismaClient,
  params: CreateWorkerJobParams
): Promise<WorkerJob> => {
  console.log(`[Worker Job Operations] Creating new worker job:`, {
    type: params.type,
    triggeredByUserId: params.triggeredByUserId,
    payload: params.payload,
  });

  const job = await prisma.workerJob.create({
    data: {
      type: params.type,
      triggeredByUserId: params.triggeredByUserId,
      contextTeamId: params.contextTeamId,
      contextProductId: params.contextProductId,
      contextVersionId: params.contextVersionId,
      payload: params.payload,
      status: WorkerJobStatus.PENDING,
    },
  });

  console.log(`[Worker Job Operations] Worker job created successfully:`, {
    id: job.id,
    type: job.type,
    status: job.status,
    createdAt: job.createdAt,
    triggeredByUserId: job.triggeredByUserId,
  });

  return job;
};

/** Create a new worker job within a transaction - used by report creation functions */
export const createWorkerJobWithTx = async (
  tx: Prisma.TransactionClient,
  params: CreateWorkerJobParams
): Promise<WorkerJob> => {
  console.log(`[Worker Job Operations] Creating new worker job in transaction:`, {
    type: params.type,
    triggeredByUserId: params.triggeredByUserId,
    payload: params.payload,
  });

  const job = await tx.workerJob.create({
    data: {
      type: params.type,
      triggeredByUserId: params.triggeredByUserId,
      contextTeamId: params.contextTeamId,
      contextProductId: params.contextProductId,
      contextVersionId: params.contextVersionId,
      payload: params.payload,
      status: WorkerJobStatus.PENDING,
    },
  });

  console.log(`[Worker Job Operations] Worker job created successfully in transaction:`, {
    id: job.id,
    type: job.type,
    status: job.status,
    createdAt: job.createdAt,
    triggeredByUserId: job.triggeredByUserId,
  });

  return job;
};

export const getProjectWorkerJobs = async (
  prisma: PrismaClient,
  teamId: string,
  projectId: string,
  type?: WorkerJobType,
  limit: number = 50
) => {
  const where: Prisma.WorkerJobWhereInput = {
    contextTeamId: teamId,
    contextProductId: projectId,
  };

  if (type) {
    where.type = type;
  }

  return await prisma.workerJob.findMany({
    where,
    include: {
      triggeredByUser: USER_SELECT,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
};

/** Get worker job by ID */
export const getWorkerJob = async (prisma: PrismaClient, jobId: string) => {
  return await prisma.workerJob.findUnique({
    where: { id: jobId },
    include: {
      triggeredByUser: USER_SELECT,
    },
  });
};

/** Get worker jobs by status and type (optional) */
export const getWorkerJobs = async (
  prisma: PrismaClient,
  status?: WorkerJobStatus,
  type?: WorkerJobType,
  limit: number = 50
) => {
  const where: Prisma.WorkerJobWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  return await prisma.workerJob.findMany({
    where,
    include: {
      triggeredByUser: USER_SELECT,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
};

export const getVersionWorkerJobs = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  type?: WorkerJobType,
  limit: number = 50
) => {
  const where: Prisma.WorkerJobWhereInput = {
    contextTeamId: teamId,
    contextVersionId: versionId,
  };

  if (type) {
    where.type = type;
  }

  return await prisma.workerJob.findMany({
    where,
    include: {
      triggeredByUser: USER_SELECT,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
};

const transformToSbomWorkerJob = (job: any): SbomWorkerJob => {
  return {
    id: job.id,
    status: job.status,
    source: job.type === WorkerJobType.REPO_GENERATE_SBOM ? SbomSource.REPO : SbomSource.FILE,
    createdAt: job.createdAt,
    processStartTime: job.processStartTime,
    processEndTime: job.processEndTime,
    errCode: job.errCode || undefined,
    errMessage: job.errMessage || undefined,
    triggeredByUser: job.triggeredByUser,
    sbomData: job.sbomReport?.sbomData,
    attachment: job.sbomReport?.attachment
      ? {
          id: job.sbomReport.attachment.id,
          name: job.sbomReport.attachment.name,
          fileSize: job.sbomReport.attachment.fileSize,
          mimeType: job.sbomReport.attachment.mimeType,
        }
      : undefined,
  };
};

export const getSbomWorkerJobs = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  limit: number = 50
): Promise<SbomWorkerJob[]> => {
  console.log(`[Worker Job Operations] Getting SBOM jobs for version:`, {
    teamId,
    versionId,
    limit,
  });

  const jobs = await prisma.workerJob.findMany({
    where: {
      contextVersionId: versionId,
      contextTeamId: teamId,
      type: {
        in: [WorkerJobType.REPO_GENERATE_SBOM, WorkerJobType.FILE_IMPORT_SBOM],
      },
    },
    include: {
      triggeredByUser: USER_SELECT,
      sbomReport: {
        include: {
          attachment: {
            select: {
              id: true,
              name: true,
              fileSize: true,
              mimeType: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  const sbomWorkerJobs: SbomWorkerJob[] = jobs.map((job) => {
    return transformToSbomWorkerJob(job);
  });

  console.log(
    `[Worker Job Operations] Found ${sbomWorkerJobs.length} SBOM jobs with enhanced data`
  );
  return sbomWorkerJobs;
};

/** Delete an SBOM worker job and its associated data */
export const deleteSbomWorkerJob = async (
  prisma: PrismaClient,
  teamId: string,
  jobId: string
): Promise<void> => {
  console.log(`[Worker Job Operations] Deleting SBOM job:`, {
    teamId,
    jobId,
  });

  // First, verify the job exists, belongs to the team, and is completed
  const job = await prisma.workerJob.findFirst({
    where: {
      id: jobId,
      contextTeamId: teamId,
      type: {
        in: [WorkerJobType.REPO_GENERATE_SBOM, WorkerJobType.FILE_IMPORT_SBOM],
      },
    },
    select: { id: true, status: true },
  });

  if (!job) {
    throw new Error(
      `SBOM job ${jobId} not found or not accessible for team ${teamId}`
    );
  }

  if (
    job.status !== WorkerJobStatus.COMPLETED &&
    job.status !== WorkerJobStatus.FAILED
  ) {
    throw new Error(
      `Cannot delete SBOM job ${jobId}: only completed or failed jobs can be deleted (current status: ${job.status})`
    );
  }

  // Delete the worker job - cascade deletes will handle SbomReport, Attachment, and File
  await prisma.workerJob.delete({
    where: { id: jobId },
  });

  console.log(
    `[Worker Job Operations] Successfully deleted SBOM job ${jobId} and all associated data`
  );
};

// Vulnerability Scan Operations

const transformToVulnerabilityScanWorkerJob = (
  job: any
): VulnerabilityScanWorkerJob => {
  return {
    id: job.id,
    status: job.status,
    source:
      job.type === WorkerJobType.REPO_SCAN_VULNERABILITIES
        ? VulnerabilityScanSource.REPO
        : VulnerabilityScanSource.SBOM_REPORT,
    createdAt: job.createdAt,
    processStartTime: job.processStartTime,
    processEndTime: job.processEndTime,
    errCode: job.errCode || undefined,
    errMessage: job.errMessage || undefined,
    triggeredByUser: job.triggeredByUser,
    scanData: job.vulnerabilityScanReport?.scanData,
    attachment: job.vulnerabilityScanReport?.attachment
      ? {
          id: job.vulnerabilityScanReport.attachment.id,
          name: job.vulnerabilityScanReport.attachment.name,
          fileSize: job.vulnerabilityScanReport.attachment.fileSize,
          mimeType: job.vulnerabilityScanReport.attachment.mimeType,
        }
      : undefined,
  };
};

export const getVulnerabilityScanWorkerJobs = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  limit: number = 50
): Promise<VulnerabilityScanWorkerJob[]> => {
  console.log(
    `[Worker Job Operations] Getting vulnerability scan jobs for version:`,
    {
      teamId,
      versionId,
      limit,
    }
  );

  const jobs = await prisma.workerJob.findMany({
    where: {
      contextVersionId: versionId,
      contextTeamId: teamId,
      type: {
        in: [
          WorkerJobType.REPO_SCAN_VULNERABILITIES,
          WorkerJobType.SBOM_REPORT_SCAN_VULNERABILITIES,
        ],
      },
    },
    include: {
      triggeredByUser: USER_SELECT,
      vulnerabilityScanReport: {
        include: {
          attachment: {
            select: {
              id: true,
              name: true,
              fileSize: true,
              mimeType: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  const vulnerabilityScanWorkerJobs: VulnerabilityScanWorkerJob[] = jobs.map(
    (job) => {
      return transformToVulnerabilityScanWorkerJob(job);
    }
  );

  console.log(
    `[Worker Job Operations] Found ${vulnerabilityScanWorkerJobs.length} vulnerability scan jobs with enhanced data`
  );
  return vulnerabilityScanWorkerJobs;
};

export const deleteVulnerabilityScanWorkerJob = async (
  prisma: PrismaClient,
  teamId: string,
  jobId: string
): Promise<void> => {
  console.log(`[Worker Job Operations] Deleting vulnerability scan job:`, {
    teamId,
    jobId,
  });

  // First, verify the job exists, belongs to the team, and is completed
  const job = await prisma.workerJob.findFirst({
    where: {
      id: jobId,
      contextTeamId: teamId,
      type: {
        in: [
          WorkerJobType.REPO_SCAN_VULNERABILITIES,
          WorkerJobType.SBOM_REPORT_SCAN_VULNERABILITIES,
        ],
      },
    },
    select: { id: true, status: true },
  });

  if (!job) {
    throw new Error(
      `Vulnerability scan job ${jobId} not found or not accessible for team ${teamId}`
    );
  }

  if (
    job.status !== WorkerJobStatus.COMPLETED &&
    job.status !== WorkerJobStatus.FAILED
  ) {
    throw new Error(
      `Cannot delete vulnerability scan job ${jobId}: only completed or failed jobs can be deleted (current status: ${job.status})`
    );
  }

  // Delete the worker job - cascade deletes will handle VulnerabilityScanReport, Attachment, and File
  await prisma.workerJob.delete({
    where: { id: jobId },
  });

  console.log(
    `[Worker Job Operations] Successfully deleted vulnerability scan job ${jobId} and all associated data`
  );
};
