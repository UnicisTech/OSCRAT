import {
  PrismaClient,
  WorkerJobType,
  WorkerJobStatus,
  WorkerJob,
} from '@prisma/client';

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
    const whereClause: any = {
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

/** Create a new worker job */
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

/** Get worker jobs for a specific project (filtered by repository IDs in payload) */
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
      organization: { teamId },
    },
    select: { id: true },
  });

  if (repositoryIds.length === 0) {
    return [];
  }

  const repositoryIdStrings = repositoryIds.map((repo) => repo.id);

  // Build the where clause for the worker job query
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
      triggeredByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
      triggeredByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  return await prisma.workerJob.findMany({
    where,
    include: {
      triggeredByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
};

/** Get worker jobs for a specific version (filtered by repository IDs in payload) */
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
      organization: { teamId }, // Include team validation for security
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
      triggeredByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
};
