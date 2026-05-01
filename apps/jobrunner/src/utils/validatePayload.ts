import { type ObjectSchema, type InferType, ValidationError } from 'yup';
import { JobError } from './JobError';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';

export async function validatePayload<S extends ObjectSchema<any>>(
  schema: S,
  payload: unknown
): Promise<InferType<S>> {
  try {
    return await schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    throw new JobError(
      ERROR_CODES.INVALID_JOB_PAYLOAD,
      error instanceof ValidationError ? error.message : 'Invalid job payload'
    );
  }
}
