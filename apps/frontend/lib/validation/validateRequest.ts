import * as Yup from 'yup';
import { ApiError } from '@/lib/errors';

/**
 * Validate request input against a Yup schema, surfacing validation failures
 * as an HTTP 400 ApiError. Any non-validation error is rethrown unchanged.
 */
export async function validateRequest<T extends Yup.AnySchema>(
  schema: T,
  data: unknown
): Promise<Yup.InferType<T>> {
  try {
    return await schema.validate(data);
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
}
