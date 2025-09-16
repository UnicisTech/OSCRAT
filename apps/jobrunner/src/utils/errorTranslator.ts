import { ProcessOutput } from 'zx';
import { JobError } from './JobError';
import { ErrorCode } from '@oscrat/model/constants/errorCodes';

export function translateError(
  context: string,
  error: any,
  errorCode: ErrorCode,
  message: string
): JobError {
  // Log the error details for debugging
  if (error instanceof ProcessOutput) {
    console.error(`[${context}] Command failed:`, {
      exitCode: error.exitCode,
      stdout: error.stdout.toString(),
      stderr: error.stderr.toString(),
      signal: error.signal,
    });
  } else if (error instanceof JobError) {
    // Already a JobError, just log and return it
    console.error(`[${context}] Job error:`, error.message);
    return error;
  } else {
    console.error(`[${context}] Unexpected error:`, error);
  }

  // Return a JobError with the specified code and message
  return new JobError(errorCode, message);
}
