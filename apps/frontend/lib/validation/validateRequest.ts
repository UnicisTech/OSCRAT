import * as Yup from 'yup';
import { ApiError } from '@/lib/errors';

/**
 * Validate request input against a Yup schema, surfacing validation failures
 * as an HTTP 400 ApiError. Any non-validation error is rethrown unchanged.
 */
export async function validateRequest<T extends Yup.AnySchema>(
  schema: T,
  data: unknown,
  options?: Yup.ValidateOptions
): Promise<Yup.InferType<T>> {
  try {
    return await schema.validate(data, options);
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
}

/** Validate a request body, stripping any keys not declared in the schema. */
export function parseBody<T extends Yup.AnySchema>(
  schema: T,
  req: { body: unknown }
): Promise<Yup.InferType<T>> {
  return validateRequest(schema, req.body, { stripUnknown: true });
}
