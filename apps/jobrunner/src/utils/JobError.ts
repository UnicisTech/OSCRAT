import { PrismaClient } from '@oscrat/model/server';
import { WorkerJob } from '@oscrat/model';
import { ERROR_CODES, ErrorCode } from '@oscrat/model/constants/errorCodes';

export class JobError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'JobError';
    this.code = code;
  }
}

export async function saveJobError(
  error: unknown,
  job: WorkerJob,
  prisma: PrismaClient
): Promise<void> {
  let errorCode: ErrorCode = ERROR_CODES.UNKNOWN_ERROR;
  let errorMessage = 'Internal server error';

  if (error instanceof JobError) {
    errorCode = error.code;
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  await prisma.workerJob.update({
    where: { id: job.id },
    data: {
      status: 'FAILED',
      errCode: errorCode,
      errMessage: errorMessage,
      processEndTime: new Date(),
    },
  });
}
