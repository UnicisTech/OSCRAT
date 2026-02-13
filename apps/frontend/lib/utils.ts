import type { NextApiRequest } from 'next';
import { ApiError } from '@/types';

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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns shortened UUID (first 5 chars) if value is a UUID, otherwise the original value */
export function shortenUuid(value: string): string {
  return UUID_REGEX.test(value) ? value.slice(0, 5) : value;
}

/** Formats a name, shortening UUIDs to "id: xxxxx" via translation */
export function formatNameWithUuidFallback(
  value: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  if (UUID_REGEX.test(value)) {
    return t('id-short', { id: shortenUuid(value) });
  }
  return value;
}
