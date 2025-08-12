import {
  PrismaClient,
  WorkerJobType,
  WorkerJobStatus,
  WorkerJob,
  Prisma,
} from '@prisma/client';
import { SbomReportSummary } from './sbomReport';

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
  payload: any;
}

export interface SbomWorkerJob extends Omit<WorkerJob, 'triggeredByUser'> {
  /** User who triggered the job */
  triggeredByUser: {
    id: string;
    name: string | null;
    email: string;
  };
  /** Repository this job is processing (extracted from payload) */
  repository?: {
    id: string;
    name: string;
    repositoryUrl: string;
    provider: string;
  };
  /** SBOM report data (only present for completed jobs with reports) */
  sbomReportSummary?: SbomReportSummary;
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

export const createSbomJob = async (
  prisma: PrismaClient,
  params: {
    repositoryId: string;
    triggeredByUserId: string;
    teamId: string;
  }
): Promise<SbomWorkerJob> => {
  // Verify repository exists and get info
  const repository = await prisma.oscratRepository.findFirst({
    where: {
      id: params.repositoryId,
      teamId: params.teamId,
    },
    select: REPOSITORY_SELECT,
  });

  if (!repository) {
    throw new Error(
      `Repository ${params.repositoryId} not found or not accessible`
    );
  }

  // Use base function to create the job
  const baseJob = await createWorkerJob(prisma, {
    type: WorkerJobType.REPO_GENERATE_SBOM,
    triggeredByUserId: params.triggeredByUserId,
    payload: { repositoryId: params.repositoryId },
  });

  // Get user info for the enhanced type
  const user = await prisma.user.findUnique({
    where: { id: params.triggeredByUserId },
    select: USER_SELECT.select,
  });

  if (!user) {
    throw new Error(`User ${params.triggeredByUserId} not found`);
  }

  console.log(`[Worker Job Operations] SBOM job created:`, {
    id: baseJob.id,
    repositoryId: params.repositoryId,
    repositoryName: repository.name,
    triggeredBy: params.triggeredByUserId,
  });

  // Return as SbomWorkerJob with repository info
  return {
    ...baseJob,
    triggeredByUser: user,
    repository,
    sbomReportSummary: undefined, // No report yet for new job
  };
};

export const getProjectWorkerJobs = async (
  prisma: PrismaClient,
  teamId: string,
  projectId: string,
  type?: WorkerJobType,
  limit: number = 50
) => {
  // Get repository IDs for this project with a single, efficient query
  const repositoryIds = await prisma.oscratRepository.findMany({
    where: {
      productId: projectId,
      teamId,
    },
    select: { id: true },
  });

  if (repositoryIds.length === 0) {
    return [];
  }

  const repositoryIdStrings = repositoryIds.map((repo) => repo.id);

  // Build the where clause for the worker job query
  // Note: JSON filter requires 'any' type due to Prisma limitations with JSON path queries
  const where: any = {
    payload: {
      path: ['repositoryId'],
      in: repositoryIdStrings,
    },
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
  // Get repository IDs for this version with team validation
  const repositories = await prisma.oscratRepository.findMany({
    where: {
      versionId,
      teamId, // Include team validation for security
    },
    select: { id: true },
  });

  const repositoryIds = repositories.map((repo) => repo.id);

  if (repositoryIds.length === 0) {
    return [];
  }

  const where: any = {
    payload: {
      path: ['repositoryId'],
      in: repositoryIds,
    },
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

/**
 * Helper to transform a job with includes to SbomWorkerJob
 */
const transformToSbomWorkerJob = (
  job: any,
  repository?: any
): SbomWorkerJob => {
  const sbomReportSummary: SbomReportSummary | undefined = job.sbomReport
    ? {
        id: job.sbomReport.id,
        jobId: job.sbomReport.jobId,
        versionId: job.sbomReport.versionId,
        productId: job.sbomReport.productId,
        sbomData: job.sbomReport.sbomData,
        sbomFile: {
          id: job.sbomReport.sbomFile.id,
          filename: job.sbomReport.sbomFile.filename,
          fileSize: job.sbomReport.sbomFile.fileSize,
          mimeType: job.sbomReport.sbomFile.mimeType ?? undefined,
        },
        job: {
          id: job.id,
          type: job.type,
          status: job.status,
          createdAt: job.createdAt,
          processStartTime: job.processStartTime ?? undefined,
          processEndTime: job.processEndTime ?? undefined,
        },
        createdAt: job.sbomReport.createdAt,
      }
    : undefined;

  return {
    ...job,
    repository: repository
      ? {
          id: repository.id,
          name: repository.name,
          repositoryUrl: repository.repositoryUrl,
          provider: repository.provider,
        }
      : undefined,
    sbomReportSummary,
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

  // Get repository IDs for this version with team validation
  const repositories = await prisma.oscratRepository.findMany({
    where: {
      versionId,
      teamId,
    },
    select: REPOSITORY_SELECT,
  });

  const repositoryIds = repositories.map((repo) => repo.id);

  if (repositoryIds.length === 0) {
    console.log(
      `[Worker Job Operations] No repositories found for version ${versionId}`
    );
    return [];
  }

  // Build where clause - JSON filter requires 'any' type due to Prisma limitations
  const where: any = {
    type: WorkerJobType.REPO_GENERATE_SBOM,
    payload: {
      path: ['repositoryId'],
      in: repositoryIds,
    },
  };

  const jobs = await prisma.workerJob.findMany({
    where,
    include: {
      triggeredByUser: USER_SELECT,
      sbomReport: {
        include: {
          sbomFile: {
            select: {
              id: true,
              filename: true,
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

  // Transform jobs with repository and SBOM report information
  const sbomWorkerJobs: SbomWorkerJob[] = jobs.map((job) => {
    const repositoryId = (job.payload as any)?.repositoryId;
    const repository = repositories.find((repo) => repo.id === repositoryId);
    return transformToSbomWorkerJob(job, repository);
  });

  console.log(
    `[Worker Job Operations] Found ${sbomWorkerJobs.length} SBOM jobs with enhanced data`
  );
  return sbomWorkerJobs;
};
