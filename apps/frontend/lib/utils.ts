import type { NextApiRequest } from 'next';
import toast from 'react-hot-toast';
import { ApiError } from '@/types';
import { getErrorCodeTranslationKey } from '@/utils/errorCodeTranslation';

export const getIpAddress = (req: NextApiRequest): string => {
  return (req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.connection?.remoteAddress ||
    'unknown') as string;
};

export const capitalizeCountryName = (name: string) => {
  if (name === 'usa') return 'USA'; // Special case for USA
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

/**
 * Extracts a meaningful error message from different error types
 * @param error The caught error
 * @param fallbackMessage A fallback message to show if no error message is available
 * @returns The error message to display
 */
export function extractErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  const apiError = error as ApiError;
  if (apiError?.message) {
    return apiError.message;
  }

  return fallbackMessage;
}

/**
 * Translate an API error via its error code, falling back to the message.
 * Use for user-facing failures that carry a typed code from `ERROR_CODES`.
 */
export function extractTranslatedErrorMessage(
  error: unknown,
  t: (key: string, values?: Record<string, string>) => string,
  fallback: string
): string {
  const err = error as
    | { code?: string; values?: Record<string, string>; message?: string }
    | undefined;

  if (err?.code) {
    return t(getErrorCodeTranslationKey(err.code), err.values);
  }
  return err?.message || fallback;
}

/** Convert any object to a plain Record<string, unknown> for APIs that require it */
export function toPlainObject<T>(obj: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(obj));
}

/** Formats byte size into human-readable string (B, KB, MB) */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Wraps an async operation with toast notifications for success/error handling
 * @param operation The async operation to execute
 * @param successMessage The message to show on success
 * @param errorFallback The fallback message to show if error message extraction fails
 * @returns The result of the operation, or null if it failed
 */
export async function asyncWithToast<T>(
  operation: () => Promise<T>,
  successMessage: string,
  errorFallback: string
): Promise<T | null> {
  try {
    const result = await operation();
    toast.success(successMessage);
    return result;
  } catch (error: unknown) {
    toast.error(extractErrorMessage(error, errorFallback));
    return null;
  }
}

/**
 * Wraps an async operation with error toast only (no success message)
 * Useful when the success handling has side effects like navigation
 * @param operation The async operation to execute
 * @param errorFallback The fallback message to show if error message extraction fails
 * @returns The result of the operation, or null if it failed
 */
export async function asyncWithErrorToast<T>(
  operation: () => Promise<T>,
  errorFallback: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error: unknown) {
    toast.error(extractErrorMessage(error, errorFallback));
    return null;
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string): boolean => UUID_REGEX.test(value);

/** Returns shortened UUID (first 5 chars) if value is a UUID, otherwise the original value */
export function shortenUuid(value: string): string {
  return isUuid(value) ? value.slice(0, 5) : value;
}

/** Formats a name, shortening UUIDs to "id: xxxxx" via translation */
export function formatNameWithUuidFallback(
  value: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  if (isUuid(value)) {
    return t('id-short', { id: shortenUuid(value) });
  }
  return value;
}
